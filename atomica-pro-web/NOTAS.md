# Web de Atómica Pro · Notas para seguir

> Esta carpeta no es parte de AlDía: se guardó acá solo para no perder el trabajo. Más adelante va a su propio repo.
> Detalle completo en `prompt-web-atomica-pro.md`.

Última sesión: 2026-11-06.

## Decidido

**Negocio**
- **Marca:** Atómica Pro, agencia digital. Solo marca, sin nombre ni foto de persona.
- **Proyectos propios de la agencia:** ChangaRed (changared.com, empleados virtuales), ChangaRed Servicios (changared.online, buscador de trabajadores) y Atómica para monotributistas.
- **Servicios:**
  - Página web a medida: landing US$ 100, página web desde US$ 250, tienda online desde US$ 450.
  - Automatizaciones: presupuesto a medida.
  - Sistemas a medida: presupuesto a medida.
- **Cliente:** comercios y profesionales de cualquier rubro. Arrancamos por Posadas, Misiones, sin atarnos a esa zona.
- **Acción principal:** WhatsApp, https://wa.me/5493764240063
- **Dominio:** atomica.click (todavía no está indexado). No tiene ficha en Google Maps.

**Mensaje**
- **Frase:** "Que te encuentren, que vendas y que te sobre tiempo."

**Diseño**
- **Paleta:** fondo verde botella `#0F3B2F`, texto crema `#F3E6CF`, nodos menta `#A7DCC5` y toque violeta `#A24BFF` (muy poquito).
- **Letras:** Anton en mayúsculas + Instrument Serif en cursiva (combinación "A"), DM Sans para textos y DM Mono para etiquetas.
- **Fondo de nodos:** va sí o sí.
- **Botón:** es un nodo violeta que late. Al tocarlo, los nodos se le conectan.
- **Franja de nodos abajo:** Google → Te encuentran → WhatsApp → Venta.
- **Trabajos ya hechos:** tarjetas con foto que entran y empujan a la anterior. Se pueden arrastrar con el dedo.
- **Formato:** código HTML para el widget HTML de Elementor (WordPress).

**Lo que NO va**
- Una palabra de otro color o en cursiva dentro de una frase.
- Texto encajonado a la izquierda.
- "Posadas" en la portada.
- Cajas y tarjetas genéricas.
- Contadores de números.
- Copiar los elementos de las referencias.
- Mucho texto: el Inicio va corto y el detalle va en páginas aparte, con visuales.

## Muestras aprobadas (carpeta `muestras/`)
- `portada.html`: aprobada ("me encanta").
- `trabajos.html`: aprobada ("excelente"). Faltan las capturas.
- `que-hacemos.html`: tiene demasiado texto. Se va a dividir en páginas por servicio, con visuales.

## Estructura acordada
- **Inicio (corto):**
  1. Portada.
  2. Servicios: 3 líneas con "Ver más".
  3. Trabajos que empujan.
  4. "Hablemos." con el botón de WhatsApp.
- **Páginas aparte:**
  - Página web a medida.
  - Automatizaciones.
  - Sistemas a medida.
  - Preguntas frecuentes.
- **Visuales propuestos:**
  - Página web: un celular mostrando una página de ejemplo.
  - Automatizaciones: un chat de WhatsApp que se responde solo.
  - Sistemas: un panel con un semáforo.
  - Todo lo de muestra va marcado como "ejemplo".

## Pendiente de Adriana
- [x] Captura de Atómica para monotributistas (pantalla de ingreso, sin email). Ideal: sumar una captura de adentro del sistema con datos de prueba.
- [x] Captura de ChangaRed (en `fotos/changared.webp`, ya puesta en la tarjeta).
- [x] ChangaRed son 2 proyectos: empleados virtuales para WhatsApp = changared.com; buscador de trabajadores en Misiones = changared.online. Los dos van en Trabajos (3 tarjetas en total).
- [ ] **Decidir dominio:** el sistema de monotributistas ya usa atomica.click. ¿Agencia en atomica.click y sistema en app.atomica.click, o agencia en otro dominio?
- [ ] Plazo de entrega de una landing, una página web y una tienda.
- [x] Email: atomicaclik@gmail.com (puesto en contacto y Qué hacemos).
- [ ] Instagram de la agencia.
- [ ] Revisar los textos que propuso Claude: los pasos de "Cómo trabajamos" y la respuesta sobre Google.
- [ ] Más adelante: crear la ficha de Google Maps y dar de alta el sitio en Search Console.

## Próximo paso
Armar el Inicio completo: portada, servicios con visuales, trabajos que empujan y "Hablemos". Después, las páginas por servicio.

## Dos versiones de cada página
- `muestras/`: para ver en el celu. Las letras y las fotos van adentro del archivo, por eso pesan mucho.
- `elementor/`: para pegar en WordPress. Son livianas (6 a 18 KB): las letras se cargan de Google Fonts y las fotos se suben a la biblioteca de medios. Después de subir cada foto hay que reemplazar su link en el código.

## Cómo pegar en Elementor
- Cada archivo de `elementor/` es un bloque listo para un **widget HTML**: no lleva `<html>`, `<head>` ni `<body>`.
- Ya tiene reglas para que el tema no pise los colores ni las letras.
- La sección que lo contiene va a **ancho completo** y con **relleno 0**, para que no queden bordes blancos.

## Inicio en Elementor (4 widgets HTML, en este orden)
1. `elementor/portada.html`
2. `elementor/franja.html` (franja crema que pasa, separadores = nodos violeta)
3. `elementor/servicios.html` (los links llevan a Qué hacemos)
4. `elementor/trabajos.html`
4b. `elementor/logos.html` (logos de herramientas que pasan, debajo de Trabajos)
5. `elementor/contacto.html` (cierre)
6. `elementor/pie.html` (pie de página con legales en ventanas; va abajo de todo)

Página aparte "Qué hacemos": `elementor/que-hacemos.html` (slug `que-hacemos`).

## Legales (ventanas en el pie, sin página aparte) — BORRADOR, revisar con abogado/contador
- Titular: Adriana Soledad Oviedo · CUIT 27-29210776-0 · Posadas, Misiones. Pagos: dólares o pesos, transferencia o Mercado Pago.
- Los textos legales van en ventanas que se abren desde la fila legal del pie (en `contacto.html` y `que-hacemos.html`): privacidad (Ley 25.326, único lugar con nombre y CUIT), términos, botón de arrepentimiento (Ley 24.240 art. 34, Res. 424/2020). Para abrir una desde un link: `#legal-privacidad`, `#legal-terminos`, `#legal-arrepentimiento`.
- Fila legal en el pie de contacto y de Qué hacemos: ©, titular, CUIT, links a legales y Data Fiscal.
- Pendiente:
  - [ ] Link del QR de Data Fiscal (ARCA): reemplazar el `#` en la fila legal.
  - [ ] Tipo de cambio para pagar en pesos.
  - [ ] Seña (sí/no, cuánto) y cuándo se paga el saldo.
  - [ ] Rondas de cambios incluidas.
  - [x] Dominio: se paga por año. Hosting: por mes o por plan con descuento según el plan (puesto en Términos y en el artículo).
  - [ ] Si se usa Google Analytics / Meta Pixel (para la parte de cookies).

## SEO (noviembre 2026)
Investigación en OpenSEO (proyecto "Atómica Pro", Argentina, gastó 19 créditos). Búsquedas/mes en Argentina y dificultad 0-100:
- automatización de procesos 170 (KD 0) · software a medida 140 (KD 0) · sistema de turnos online 90 (KD 0)
- bot de whatsapp 210 (KD 19) · chatbot whatsapp 390 (KD 27) · cuánto cuesta una página web en Argentina 30 (KD 16)
- diseño de páginas web 1000 (KD 66, difícil) · diseño web argentina 260 (KD 100) · diseño web Posadas 10 (baja, pero intención de compra)
Estrategia: ganar primero en software a medida / automatizaciones / bot de WhatsApp / precios + ficha de Google Maps para Posadas.

Títulos y descripciones (Rank Math o Yoast):
- Inicio: "Páginas web y automatizaciones en Posadas | Atómica Pro" / "Páginas web, tiendas online, bots de WhatsApp y software a medida para comercios y profesionales de Posadas. Landing desde US$ 100. ¡Escribinos!"
- Qué hacemos: "Software a medida y bots de WhatsApp | Atómica Pro" / "Landing desde US$ 100, páginas web desde US$ 250 y tiendas desde US$ 450. Automatización de procesos y software a medida en Posadas, Misiones."

Hecho en el código: H1 de la portada con palabras clave (se ve igual), datos estructurados del negocio en la portada, textos de Qué hacemos con "bot de WhatsApp", "automatización de procesos", "software a medida", "cuánto cuesta una página web en Argentina".

Próximos artículos/páginas sugeridos:
1. ¿Cuánto cuesta una página web en Argentina? (con los precios reales)
2. Bot de WhatsApp para tu negocio (relacionado con ChangaRed)
3. Sistema de turnos online / software a medida

## Artículo de precios
- `elementor/articulo-precios.html` → página nueva, slug `cuanto-cuesta-una-pagina-web-en-argentina` (publicado).
- Título SEO: "¿Cuánto cuesta una página web en Argentina? (2026)" · Descripción: "Landing US$ 100, página web desde US$ 250 y tienda online desde US$ 450. Qué incluye cada opción y de qué depende el precio. Atómica Pro, Posadas."
- Palabra clave principal: "cuánto cuesta una página web en Argentina".

## Artículo bot de WhatsApp
- `elementor/articulo-bot-whatsapp.html` → página nueva, slug `bot-de-whatsapp-para-negocios`.
- Título SEO: "Bot de WhatsApp para tu negocio: qué hace y cuánto cuesta" · Descripción: "Un bot de WhatsApp contesta precios, toma pedidos, da turnos y cobra por vos. Conocé ChangaRed: 1 mes gratis y después USD 19 por mes. Atómica Pro."
- Palabras clave: bot de whatsapp (210/mes, KD 19), chatbot whatsapp (390/mes, KD 27).
