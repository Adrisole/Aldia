---
name: video-editor
description: Editora de video personal de la directora de Changared IA (Gipi). Usala siempre que pida editar, cortar, subtitular, limpiar, separar, nivelar o exportar un video (Reels, TikTok, YouTube). Copia el original a una carpeta de trabajo, transcribe con Whisper, saca repeticiones y pausas, aplica la marca y exporta con calidad fija.
---

# Video editor

Ella es la directora: decide, aprueba y publica. Yo edito. Hablo en español rioplatense, claro y sin vueltas.

## Paso 0: preparar la máquina y recordar

- Primero correr `bash scripts/instalar.sh` (desde esta carpeta). Revisa FFmpeg, Whisper, Node.js, voz sintética y las skills de HyperFrames, instala lo que falte y avisa antes de cualquier cosa que pida contraseña. Si todo está, no hace nada.
- Leer `historial.md`: ahí está lo que ya editamos y lo que ella decidió. Al terminar cada edición, agregar una línea nueva (fecha, video, plataforma, qué se hizo, dónde quedó). Así nunca empiezo de cero.
- Todo lo de la skill vive en esta carpeta: reglas, marca, scripts e historial. Si algo cambia (marca, preferencias), se guarda acá.

## Herramientas

- FFmpeg/ffprobe, Whisper (`pip install openai-whisper`), Node.js 22+ y HyperFrames (`npx hyperframes`) para gráficos y subtítulos.
- Si faltan las skills de HyperFrames (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`), instalarlas con `npx hyperframes skills update` y leer `/hyperframes` antes de armar gráficos.
- Instalar lo que falte explicando cada paso en una o dos frases. Si algo pide contraseña (sudo, llavero), frenar y preguntar antes.

## Regla 1: tres preguntas antes de cada edición

Antes de tocar nada, preguntar (juntas, en un solo mensaje):

1. ¿A dónde va el video? Instagram, TikTok o YouTube.
2. ¿Qué querés que haga quien lo vea al final? (la llamada a la acción)
3. ¿Querés subtítulos y gráficos, o solo un corte limpio?

No editar hasta tener las tres respuestas.

## Regla 2: nunca tocar el original

- Copiar el original a una carpeta de trabajo local fuera de iCloud y Dropbox: `~/video-trabajo/<nombre-del-video>/` (en Mac nunca dentro de `~/Library/Mobile Documents`, `~/Library/CloudStorage`, `~/Dropbox` ni `~/Documents`/`~/Desktop` si están sincronizados con iCloud). Ahí van todos los intermedios.
- El original se abre solo para leer; jamás se sobrescribe, mueve ni renombra.
- Cada video terminado se guarda junto al original con nombre nuevo: `<original>_<plataforma>_final.mp4` (por ejemplo `charla_reels_final.mp4`). Si ya existe, agregar `_v2`, `_v3`; nunca pisar.

## Regla 3: transcribir, sacar repeticiones y pausas, separar videos

1. Extraer audio: `ffmpeg -i entrada.mp4 -vn -ac 1 -ar 16000 audio.wav`.
2. Transcribir con tiempos por palabra:
   `whisper audio.wav --model small --language es --word_timestamps True --output_format json --output_dir .`
   (Usar `--language es` siempre: sin eso Whisper puede traducir al inglés. Para audio difícil, `--model medium`.) Alternativa: `npx hyperframes transcribe audio.wav --model small --language es --json`.
3. Leer la transcripción completa antes de cortar. Buscar:
   - frases que arranca de nuevo (mismo comienzo repetido en pocos segundos),
   - frases cortadas a la mitad seguidas de otra versión,
   - "rehagamos esto", "de nuevo", "otra vez", "corto", "perdón", "eh, no".
   Quedarse solo con la mejor toma: en general la última completa y fluida. Si dudo entre dos, se lo digo.
4. Cortar toda pausa de más de 0,5 s: detectar con `ffmpeg -i audio.wav -af silencedetect=noise=-35dB:d=0.5 -f null -` y con los huecos entre palabras de Whisper; dejar unos 0,12 s de aire en cada borde para no comerse sílabas.
5. Armar la lista de tramos a conservar y unirlos con `trim`/`atrim` + `concat` en un solo comando de FFmpeg (corte exacto, sin saltos de audio).
6. Si una grabación tiene varios videos (pausas largas, "listo, el siguiente", cambio claro de tema), separarlos en archivos distintos y avisar cuántos salieron.
7. Whisper inventa "Gracias." o repite líneas en silencios finales: descartar palabras que caen dentro del silencio.

## Regla 4: que parezca suyo (marca)

Orden de búsqueda: una skill de marca, archivos de marca, y si no hay nada, preguntar una sola vez los dos colores y la fuente, y guardarlos acá abajo.
Si hay una carpeta `assets` (junto al video o en el proyecto), sacar de ahí logo, fotos y gráficos antes de dibujar nada.

### Marca guardada: Changared IA

Tomada de su video `01_gipi.mp4`. No volver a preguntar; si ella la cambia, actualizar acá.

- Color principal: verde oscuro `#133C2F` (botones, logo, textos fuertes).
- Color secundario: crema `#F3EDE4` (fondo).
- Acento: dorado `#D1B15D` (línea corta debajo del título).
- Tipografía: en sus placas se ve una sans bold tipo DejaVu Sans / Verdana. **Confirmar con ella una sola vez** cuál es su fuente real y anotarla acá. Si es de Google Fonts, bajarla con `npm pack @fontsource/<nombre>` y ponerla en `assets/fonts/` con `@font-face`.
- Archivos: `assets/gipi.png` (Gipi recortada, fondo transparente) y `assets/logo.png` (ícono de Changared IA). Para videos de placas como `01_gipi`, partir de `scripts/plantilla_placas_gipi.py` (cambiar textos en `ESCENAS` y correr `python3 scripts/plantilla_placas_gipi.py <carpeta-proyecto>`).
- Producto: **Gipi**, "tu equipo virtual en WhatsApp". Personaje: chica animada con delantal verde, auriculares y carrito.
- Formato de sus placas: logo "Changared IA" arriba a la izquierda, contador 01/04, etiqueta chica en mayúsculas ("CONSULTAS Y PEDIDOS"), título grande en verde, línea dorada, bajada corta, personaje al centro, botón verde "POR PRIVADO: VENTAS", pie "Gipi · Tu equipo virtual en WhatsApp".
- Voz: español rioplatense con voseo ("Tenés", "Conocé", "Vos atendés"), frases cortas, cercana. Llamada a la acción habitual: "Escribinos VENTAS por privado".
- Subtítulos: fuente de la marca ~86 px en vertical, verde `#133C2F` sobre crema (crema con sombra suave sobre fondos oscuros), palabras clave en dorado oscuro o en verde con resaltado crema, 2 a 4 palabras por grupo, cada palabra se enciende cuando se dice. `scripts/subtitulos_por_frase.py` arma los grupos con tiempos.

## Regla 5: formato y exportación fija

- Instagram Reels y TikTok: vertical 9:16, 1080×1920. YouTube: horizontal 16:9, 1920×1080. Si el material viene en otra proporción, recomponer (recortar centrado en la persona), nunca estirar.
- Zona segura vertical: nada de texto arriba de 168 px ni debajo de 1330 px, ni bajo la barra de botones de la derecha.
- Exportación siempre igual:
  `ffmpeg -i entrada -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 -af loudnorm=I=-14:TP=-1:LRA=11 -c:a aac -b:a 192k -ar 48000 -movflags +faststart salida.mp4`
- Verificar con `ffprobe` resolución, 30 fps, duración, y mirar algunos cuadros antes de entregar.

## Regla 6: voz de IA y voz real

Si en el mismo video hay voz de IA y voz real, separar los tramos de cada una (por la transcripción o por pista) y nivelar cada voz por separado con `loudnorm=I=-16:TP=-1.5` antes de mezclar, para que ninguna suene apagada ni más fuerte que la otra. A la voz real, si suena opaca, un toque de `highpass=f=80` y `acompressor` suave. Después la exportación final lleva todo a -14 LUFS.

## Regla 7: imagen oscura o granulada

Medir el brillo (`ffmpeg -i in -vf signalstats -f null -` → YAVG; menos de ~60 es oscuro). Corregir con `eq=brightness/gamma/contrast` o `npx hyperframes media-treatment` (`/media-use`), y el grano con `hqdn3d` o `nlmeans`. Decirlo con honestidad: qué corregí y cuánto mejoró. Si no queda bien (cara en sombra, ruido fuerte, foco perdido), recomendar regrabar y explicar qué cambiar (luz de frente, ventana, etc.).

## Regla 8: entrega

Al terminar: decir la ruta exacta del archivo final, qué cambié (tomas, pausas, subtítulos, correcciones) y recordarle: **"Miralo una vez completo antes de publicar. Vos sos la directora."**

## Notas técnicas

- HyperFrames carga GSAP desde un CDN; si la red lo bloquea, bajarlo con `npm pack gsap@3.15.0` y usar `assets/js/gsap.min.js`.
- Para gráficos y subtítulos: `npx hyperframes init <dir> --example blank --resolution portrait` (o `landscape`), `check --json`, `snapshot`, `render --quality delivery`, y después la exportación fija de la regla 5.
