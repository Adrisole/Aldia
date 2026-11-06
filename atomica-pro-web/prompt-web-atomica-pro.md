# Prompt maestro · Web de Atómica Pro

Actuá como diseñador web senior, especialista en SEO técnico y en GEO (que te citen ChatGPT, Gemini y Perplexity). Armá la web de **Atómica Pro**. Usá solo los datos de este documento. Si falta algo, dejalo como `[A COMPLETAR: …]`. Nunca inventes.

## 1. Quién es

- **Nombre:** Atómica Pro, agencia digital.
- **Dominio:** atomica.click (todavía no está indexado).
- **Qué vende (3 servicios):**
  1. **Página web a medida** (landings y tiendas online).
  2. **Automatizaciones** (responder mensajes, tomar pedidos, turnos, recordatorios de pago).
  3. **Sistema a medida** (ejemplo real: Atómica para monotributistas).
- **Proyectos propios para mostrar como trabajos:**
  - **ChangaRed** (changared.com): empleados virtuales para el WhatsApp de un negocio. Gipi vende, Whappi da turnos y Clau cobra.
  - **Atómica para monotributistas:** sistema de gestión para monotributistas y sus contadores.
- **Dónde:** Posadas, Misiones. Arranca por Posadas y después suma otras zonas.
- **Quién da la cara:** solo la marca. Sin nombre ni foto de persona.

## 2. A quién le habla y qué dolor resuelve

- **Cliente:** comercios y profesionales de cualquier rubro.
- **Dolor:** no los encuentran en Google, pierden tiempo haciendo todo a mano y la gente consulta pero no compra.
- **Frase principal:** "Que te encuentren, que vendas y que te sobre tiempo."

## 3. Qué tiene que hacer quien entra

- **Una sola acción:** escribir por WhatsApp.
- **Link:** https://wa.me/5493764240063
- **Texto del botón:** "Hablemos por WhatsApp". Podés sumar un mensaje precargado, por ejemplo: "Hola, quiero una página para mi negocio".

## 4. Precios (publicados, en dólares)

- **Landing (una página):** US$ 100.
- **Página web (varias secciones):** desde US$ 250.
- **Tienda online:** desde US$ 450.
- **Automatizaciones:** presupuesto a medida, según lo que necesite el cliente.
- **Sistema a medida:** presupuesto a medida, según lo que necesite el cliente.

## 5. Páginas

1. **Inicio:** corta y con impacto. La portada todavía no está definida (ver punto 7).
2. **Qué hacemos:** la página para SEO.
   - Explica qué hace Atómica Pro, para quién y cómo trabaja.
   - Detalla los 3 servicios (página web a medida, automatizaciones, sistema a medida) con sus precios.
   - Muestra los trabajos (ChangaRed y Atómica para monotributistas).
   - Cierra con preguntas frecuentes y el botón de WhatsApp.
   - Acá sí se nombra Posadas, Misiones.

## 6. Formato técnico

- Código HTML + CSS + JS para pegar en el **widget HTML de Elementor** (WordPress), por bloques o secciones.
- Sin librerías pesadas. Que cargue rápido en el celular.
- **Primero el celular:** que se vea perfecto a 375 px.
- **Accesible:** buen contraste, botones grandes y respeto a "reducir movimiento" (`prefers-reduced-motion`).

## 7. Diseño (decisiones ya tomadas)

- **Paleta elegida (opción 2):** fondo verde botella `#0F3B2F`, textos crema `#F3E6CF`, nodos menta `#A7DCC5` y toque violeta `#A24BFF` (muy poquito).
- **Fondo:** nodos y líneas en movimiento (canvas liviano). Va sí o sí.
- **Botón "Hablemos":** es un nodo violeta que late. Al pasar el mouse (compu) o al tocarlo (celu), los nodos cercanos se le conectan en medio segundo y se abre el WhatsApp.
- **Franja de abajo:** una línea de nodos que se encienden en orden: Google → te encuentran → WhatsApp → venta.
- **Letras:** títulos en **Anton** (mayúsculas, angosta) combinada con **Instrument Serif** en cursiva. Ej. portada: "QUE TE ENCUENTREN," en Anton y "que vendas y que te sobre tiempo" en Instrument Serif cursiva. Textos en DM Sans. Etiquetas en DM Mono.
- **Título:** centrado y grande.
- Tomar la idea de los 3 colores de las referencias, nunca copiar sus elementos (círculo giratorio, franja de palabras).
- **Etiquetas chicas:** letra monoespaciada y en mayúsculas.
- **Servicios:** en lista, separados con líneas finas, sin cajas.

**Lo que NO va:**
- Una palabra del título en otro color o en cursiva.
- Texto encajonado a la izquierda.
- "Posadas" en la portada.
- Cajas y tarjetas.
- Contadores de números ("+100 clientes").
- Degradés violeta de fondo.
- Íconos genéricos.
- Frases como "transformá tu negocio".

**Portada:** centrada, con los nodos, el botón-nodo y la franja de nodos. Armar primero una muestra para que Adriana la apruebe.

## 8. SEO

- **Título SEO:** 50 a 60 caracteres. **Meta descripción:** 140 a 160 caracteres. Que sean distintos en cada página.
- Un solo H1 por página. Los H2 llevan palabras que la gente busca, por ejemplo "página web para mi negocio", "tienda online" o "diseño web Posadas".
- **Datos estructurados (JSON-LD):**
  - `ProfessionalService` con nombre, dominio, teléfono, zona (Posadas, Misiones, Argentina) y precios.
  - `FAQPage` en la página "Qué hacemos".
  - `WebSite`.
- **En el `<head>`:** canonical, Open Graph (para que el link se vea bien en WhatsApp), favicon e idioma `es-AR`.
- **Imágenes:** texto alternativo descriptivo, formato WebP y carga diferida.
- **Velocidad:** apuntar a buen puntaje en Core Web Vitals. El canvas de nodos no puede trabar la carga.

## 9. GEO (para que te citen las IA)

- Que la primera oración de cada sección responda algo concreto.
- **Definición clara:** "Atómica Pro es una agencia digital de Posadas, Misiones, que hace páginas web y tiendas online para comercios y profesionales."
- **Preguntas frecuentes reales** con respuestas cortas: cuánto cuesta, cuánto tarda, si sirve para mi rubro, si aparece en Google, qué necesito para empezar.
- Usar siempre el mismo nombre, **Atómica Pro**, igual en todos lados.

## 10. Voz

- Español rioplatense, con voseo, cercano y directo. Frases cortas.
- Que suene humano, no a texto de IA.

## 11. Pendientes (pedírselos a Adriana, no inventarlos)

- [ ] Aprobar la muestra de portada.
- [ ] Plazo de entrega de una landing y de una tienda.
- [ ] Capturas de ChangaRed y de Atómica para monotributistas.
- [ ] Email e Instagram de la agencia.
- [ ] Logo en versión para fondo oscuro.
- [ ] Crear la ficha de Google Maps (Google Business Profile).
- [ ] Dar de alta atomica.click en Google Search Console cuando esté publicada.

## 12. Antes de entregar

- Revisar a 375 px y a 1280 px.
- Probar que el WhatsApp abra bien.
- Verificar que no haya ningún dato inventado.
- Pasar la revisión de imppecable (anti-diseño de IA).
- Validar el JSON-LD con la prueba de resultados enriquecidos de Google.
