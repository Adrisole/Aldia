# AlDía — Especificación técnica del backend

**Versión:** 1.0 · Julio 2026
**Producto:** Cobranzas automáticas por WhatsApp con conciliación de Mercado Pago y emisión de recibos.
**Propósito de este documento:** guía de construcción para implementar el backend con Claude Code. El prototipo de interfaz (`aldia-prototipo.jsx`) define la experiencia visual; este documento define el motor.

---

## 1. Qué hace el sistema (resumen en una frase)

Un negocio con cobros recurrentes (cuotas, alquileres, abonos) carga a sus clientes y sus vencimientos; AlDía persigue automáticamente cada deuda vencida por WhatsApp con links de pago de Mercado Pago, detecta el pago vía webhook, frena la secuencia, registra el cobro y envía el recibo — sin intervención humana.

## 2. Principios de diseño (no negociables)

1. **Multi-tenant desde el día uno.** Cada negocio es un tenant aislado. Toda tabla lleva `tenant_id`. Nunca un dato de un negocio puede filtrarse a otro.
2. **La plata nunca pasa por AlDía.** Los cobros van directo a la cuenta de Mercado Pago del negocio vía OAuth. AlDía solo genera links y escucha webhooks.
3. **Horizontal en el motor, vertical en la piel.** El vocabulario (cuota/alquiler, alumno/inquilino) es configuración del tenant, no código duplicado.
4. **Idempotencia en todo lo que toca plata.** Webhooks duplicados, reintentos y race conditions no pueden generar recibos dobles ni cortar secuencias equivocadas.
5. **API oficial de WhatsApp (Cloud API), nunca librerías no oficiales.** Un número bloqueado destruye la confianza del cliente.
6. **El recibo es comprobante interno, no factura fiscal.** Aclaración visible en cada comprobante.

## 3. Stack sugerido

- **Backend:** Node.js + Express (o Fastify) + TypeScript
- **Base de datos:** PostgreSQL (multi-tenant por columna `tenant_id`; no usar MongoDB — acá las relaciones y transacciones importan)
- **Cola de trabajos:** BullMQ + Redis (para la secuencia de mensajes programados)
- **Integraciones:** Mercado Pago (OAuth + Preferencias + Webhooks), WhatsApp Cloud API (Meta), email transaccional (Resend o similar) como respaldo
- **Frontend:** el prototipo existente, migrado a Vite + React + Tailwind
- **Hosting inicial:** Railway, Render o similar (necesita URL pública estable para webhooks)

## 4. Modelo de datos

```sql
-- Negocios (tenants)
tenants (
  id UUID PK,
  nombre TEXT NOT NULL,              -- "Del Valle Propiedades"
  rubro TEXT NOT NULL,               -- "inmobiliaria" | "gimnasio" | "instituto" | ...
  vocabulario JSONB NOT NULL,        -- { unidad: "alquiler", persona: "inquilino" }
  logo_url TEXT,
  whatsapp_phone_id TEXT,            -- ID del número en WhatsApp Cloud API
  email_respaldo TEXT,
  mp_user_id TEXT,                   -- ID de la cuenta MP conectada
  mp_access_token TEXT,              -- cifrado en reposo (ver §8)
  mp_refresh_token TEXT,             -- cifrado en reposo
  mp_conectado BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'trial',         -- trial | activo | suspendido
  creado_en TIMESTAMPTZ DEFAULT now()
)

-- Clientes del negocio (deudores)
clientes (
  id UUID PK,
  tenant_id UUID FK -> tenants,
  nombre TEXT NOT NULL,
  whatsapp TEXT,                     -- E.164: +5493764128830
  email TEXT,
  referencia TEXT,                   -- "Bolívar 1420 3°B" / "Plan familiar" / libre
  activo BOOLEAN DEFAULT TRUE,
  UNIQUE (tenant_id, whatsapp)
)

-- Deudas (la unidad de trabajo del sistema)
deudas (
  id UUID PK,
  tenant_id UUID FK -> tenants,
  cliente_id UUID FK -> clientes,
  concepto TEXT NOT NULL,            -- "Alquiler junio · Bolívar 1420 3°B"
  monto NUMERIC(12,2) NOT NULL,
  vencimiento DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  -- pendiente | en_secuencia | respondio_manual | pausada | cobrada | incobrable
  paso_secuencia INT DEFAULT 0,      -- 0=nada, 1=aviso, 2=recordatorio, 3=último
  mp_preference_id TEXT,             -- preferencia de pago generada
  mp_payment_id TEXT,                -- pago acreditado (si existe)
  creado_en TIMESTAMPTZ DEFAULT now()
)

-- Cobros registrados (histórico inmutable)
cobros (
  id UUID PK,
  tenant_id UUID FK -> tenants,
  deuda_id UUID FK -> deudas,
  numero_recibo TEXT NOT NULL,       -- "R-0148", correlativo POR TENANT
  monto NUMERIC(12,2) NOT NULL,
  medio TEXT NOT NULL,               -- "mercado_pago" | "transferencia" | "efectivo"
  via TEXT NOT NULL,                 -- "automatico" | "manual"
  mp_payment_id TEXT UNIQUE,         -- clave de idempotencia para webhooks
  recibo_enviado_wa BOOLEAN DEFAULT FALSE,
  recibo_enviado_email BOOLEAN DEFAULT FALSE,
  cobrado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, numero_recibo)
)

-- Mensajes enviados/recibidos (auditoría y timeline del chat)
mensajes (
  id UUID PK,
  tenant_id UUID FK -> tenants,
  deuda_id UUID FK -> deudas,
  direccion TEXT NOT NULL,           -- "saliente" | "entrante" | "sistema"
  tipo TEXT NOT NULL,                -- "aviso_1" | "recordatorio_2" | "ultimo_3" | "recibo" | "respuesta_cliente" | "resumen_semanal"
  contenido TEXT NOT NULL,
  wa_message_id TEXT,                -- ID de Meta para tracking de entrega
  estado_entrega TEXT,               -- "enviado" | "entregado" | "leido" | "fallido"
  creado_en TIMESTAMPTZ DEFAULT now()
)
```

**Nota sobre el correlativo de recibos:** generar `numero_recibo` con una secuencia por tenant dentro de una transacción (o `SELECT ... FOR UPDATE` sobre un contador en `tenants`), nunca con `MAX()+1` suelto — dos webhooks simultáneos no pueden producir el mismo número.

## 5. La máquina de estados de la secuencia

```
                    vencimiento alcanzado
  pendiente ──────────────────────────────> en_secuencia (paso 1: aviso)
                                                 │
                          día +3 sin pago        │        cliente responde
                    ┌────────────────────────────┤────────────────────────┐
                    v                            │                        v
          en_secuencia (paso 2)                  │              respondio_manual
                    │                            │              (secuencia FRENADA,
                    │  día +7 sin pago           │               notificar al dueño)
                    v                            │
          en_secuencia (paso 3: último aviso)    │
                    │                            │
                    │  (fin: no se insiste más)  │
                    v                            │
              queda en paso 3                    │
                                                 │
   EN CUALQUIER PASO:                            │
   pago acreditado (webhook MP) ─────────────────┴──> cobrada
   pago manual registrado ───────────────────────────> cobrada
   dueño pausa ──────────────────────────────────────> pausada (reanudable)
```

**Reglas duras:**
- La secuencia tiene **exactamente 3 mensajes** (día 0, +3, +7). Después del tercero, silencio. Más mensajes = spam = número bloqueado.
- **Cualquier respuesta del cliente frena la secuencia** inmediatamente y notifica al dueño por WhatsApp. Un bot que sigue insistiendo después de "la semana que viene te pago" quema la relación comercial del negocio.
- Todo mensaje incluye la salida: *"Si ya pagaste o querés hablar con nosotros, respondé este mensaje."*
- El pago (webhook o manual) frena la secuencia desde cualquier estado, cancela los jobs pendientes en la cola, registra el cobro y dispara el recibo — en esa transacción, en ese orden.

**Implementación:** al entrar una deuda en secuencia, encolar los 3 jobs con delay (BullMQ `delayed jobs`). Cada job, antes de enviar, **relee el estado de la deuda** — si ya no está `en_secuencia`, se descarta silenciosamente. Esto hace el sistema robusto ante race conditions sin locks complejos.

**Horario de envío:** los mensajes salen entre 9:00 y 20:00 hora del negocio (config del tenant, default America/Argentina/Buenos_Aires). Un job que vence a las 3 AM se difiere a las 9:00.

## 6. Integración con Mercado Pago

### 6.1 Conexión (OAuth, una sola vez por tenant)
1. Botón "Conectar con Mercado Pago" → redirect a `https://auth.mercadopago.com.ar/authorization?client_id=...&response_type=code&redirect_uri=...&state={tenant_id firmado}`
2. Callback: intercambiar `code` por `access_token` + `refresh_token` del vendedor. Guardar cifrados.
3. Los tokens de MP expiran (180 días) — job periódico de refresh.
4. `state` firmado (HMAC) para impedir que un tenant conecte la cuenta sobre otro tenant.

### 6.2 Generación del link de pago (por deuda)
Al entrar la deuda en secuencia, crear una **Preferencia de pago** contra la cuenta del vendedor:
- `items`: concepto y monto de la deuda
- `external_reference`: `deuda_id` (la clave que une el pago con la deuda)
- `notification_url`: el webhook de AlDía
- Guardar `preference_id` y usar `init_point` como URL en los mensajes.

### 6.3 Webhook de conciliación (el corazón del sistema)
```
POST /webhooks/mp
1. Verificar firma (x-signature de MP) — rechazar lo no verificable.
2. Responder 200 INMEDIATAMENTE; procesar async (MP reintenta si no hay 200 rápido).
3. Consultar el pago a la API de MP con el payment_id recibido (nunca confiar
   solo en el payload del webhook).
4. Si status = "approved":
   a. Buscar deuda por external_reference.
   b. IDEMPOTENCIA: si ya existe cobro con ese mp_payment_id → terminar (no duplicar).
   c. Transacción: deuda → cobrada · generar numero_recibo · insertar cobro
      · cancelar jobs de secuencia.
   d. Enviar recibo por WhatsApp (y email si está configurado).
5. Cualquier otro status: registrar y no actuar.
```

### 6.4 Pagos por fuera (transferencia / efectivo)
Endpoint `POST /deudas/:id/pago-manual` (autenticado, del panel): mismo flujo desde 4c, con `medio` según corresponda y `via = "manual"`.

## 7. Integración con WhatsApp Cloud API

### 7.1 Setup por tenant
Fase piloto: **un solo número WABA de AlDía**, con el nombre del negocio dentro del mensaje ("Te escribimos de Del Valle Propiedades..."). Fase 2: cada negocio conecta su propio número vía Embedded Signup de Meta. No bloquear el MVP con esto.

### 7.2 Plantillas (los mensajes salientes iniciados por el negocio REQUIEREN plantillas pre-aprobadas por Meta)
Registrar estas plantillas en español (categoría **UTILITY**, no MARKETING — son transaccionales y cuestan menos):

| Plantilla | Variables | Uso |
|---|---|---|
| `aviso_vencimiento` | negocio, nombre, concepto, monto, link | Día 0 |
| `recordatorio_pago` | negocio, nombre, concepto, link | Día +3 |
| `ultimo_aviso` | negocio, nombre, concepto | Día +7 |
| `recibo_pago` | negocio, nro_recibo, concepto, monto, medio, fecha | Al acreditarse |
| `resumen_semanal` | negocio, recuperado, en_gestion, tasa | Lunes 9:00, al dueño |

Texto base: usar los del prototipo (tono formal, sin emojis, con la salida "respondé este mensaje" al pie).

**Nota de costos:** las conversaciones iniciadas por el negocio se cobran por ventana de 24 h. El recibo que sale dentro de la ventana abierta por la secuencia no genera cargo adicional. Presupuestar ~USD 0,03–0,07 por conversación en Argentina (verificar tarifa vigente de Meta).

### 7.3 Webhook de entrada
```
POST /webhooks/whatsapp  (verificar token de Meta en el GET de suscripción)
- Mensaje entrante de un cliente con deuda en_secuencia:
  → estado = respondio_manual, cancelar jobs, guardar mensaje,
    notificar al dueño: "Carla Benítez respondió sobre su cuota de junio: '...'"
- Statuses (sent/delivered/read/failed): actualizar estado_entrega del mensaje.
  Si failed por número inválido → marcar y avisar al dueño en el resumen.
```

## 8. Seguridad (lista corta pero obligatoria)

- Tokens de MP **cifrados en reposo** (AES-256-GCM con clave en variable de entorno; nunca en texto plano en la DB). *(Lección aprendida de TalleExacto: las credenciales expuestas se pagan caro.)*
- Verificación de firma en **ambos** webhooks (MP: `x-signature`; Meta: `X-Hub-Signature-256`).
- Auth del panel: sesiones o JWT; toda query filtrada por `tenant_id` del usuario autenticado — nunca aceptar `tenant_id` del cliente.
- Rate limiting en endpoints públicos.
- Ningún secreto en el repo: `.env` + `.env.example` documentado.
- Logs sin datos sensibles (no loguear tokens ni teléfonos completos).

## 9. API del panel (mínima para el MVP)

```
POST   /auth/login
GET    /me                          → tenant + config

GET    /clientes                    · POST /clientes · PUT /clientes/:id
POST   /clientes/importar           → CSV/Excel (nombre, whatsapp, referencia)

GET    /deudas?estado=&mes=         → alimenta la pestaña Deudas
POST   /deudas                      · POST /deudas/generar-mes (recurrentes)
POST   /deudas/:id/pausar           · /reanudar · /pago-manual
GET    /deudas/:id/mensajes         → timeline del chat

GET    /cobros?mes=                 → pestaña Cobros y recibos
POST   /cobros/:id/reenviar-recibo  → WhatsApp o email

GET    /metricas?mes=               → recuperado, en gestión, tasa
PUT    /config                      → identidad, canales
GET    /mp/oauth/iniciar            · GET /mp/oauth/callback

POST   /webhooks/mp                 (público, firmado)
POST   /webhooks/whatsapp           (público, firmado)  + GET verificación
```

**Deudas recurrentes:** los clientes tienen cargo mensual fijo (monto + día de vencimiento en `clientes` o tabla `planes`); un cron el día 1 genera las deudas del mes. Es la operación que le ahorra al negocio cargar todo a mano cada mes.

## 10. Orden de construcción sugerido (para Claude Code)

1. **Fundación:** proyecto TS + Express, PostgreSQL con el esquema §4, auth simple, seed con los datos del prototipo.
2. **CRUD + panel conectado:** endpoints §9 y migrar el prototipo a Vite consumiendo la API real. *(Hito: el panel muestra datos de la DB.)*
3. **Motor de secuencias:** BullMQ, máquina de estados §5, cron de vencimientos. Sin WhatsApp todavía — los "envíos" se loguean en `mensajes`. *(Hito: una deuda vencida genera sus 3 mensajes programados y se frena al registrar pago manual.)*
4. **Mercado Pago:** OAuth + preferencias + webhook con idempotencia. Probar en sandbox de punta a punta. *(Hito: un pago de prueba frena la secuencia y registra el cobro con recibo correlativo.)*
5. **WhatsApp Cloud API:** plantillas, envío real, webhook de entrada. *(Hito: el flujo completo con un número de prueba.)*
6. **Recibos + resumen semanal:** plantilla de recibo automático post-cobro, cron de lunes 9:00, email de respaldo.
7. **Pulido pre-piloto:** importación CSV, generación mensual de deudas, onboarding guiado (config → conectar MP → importar clientes → primera deuda).

Cada fase termina con su hito verificable antes de pasar a la siguiente. No avanzar con WhatsApp real hasta que el sandbox de MP funcione perfecto: la plata primero.

## 11. Fuera de alcance del MVP (anotado para que nadie lo cuele)

- Facturación fiscal / ARCA (futuro premium)
- Actualización automática de alquileres por índice (ICL/IPC) — el monto lo carga el negocio; anotar como diferenciador futuro del vertical inmobiliario
- Múltiples usuarios por tenant / roles
- App móvil (el panel es responsive; alcanza)
- Otros medios de pago además de MP + manual
- Multi-moneda

---

*Documento generado a partir del diseño de producto de AlDía. Prototipo de referencia: `aldia-prototipo.jsx`.*
