"""Genera el proyecto HyperFrames del Reel de Gipi (Changared IA)."""
import json, sys, os

P = sys.argv[1]
D = 4.4            # duración de cada escena
CTA = 4.6          # duración del cierre
TOTAL = round(4 * D + CTA, 2)

FONT = """
@font-face { font-family: "DejaVu Sans"; font-weight: 700; src: url("assets/fonts/DejaVuSans-Bold.ttf"); }
@font-face { font-family: "DejaVu Sans"; font-weight: 400; src: url("assets/fonts/DejaVuSans.ttf"); }
"""

ESCENAS = [
    dict(n="01", titulo=["Tenés", "las", "manos", "ocupadas."], salto=2,
         subs=[("Y acaba de entrar", ""), ("otro “¿cuánto sale?”", "“¿cuánto,sale?”")],
         graf=[("in", "¿cuánto sale?", 60, 690, 0.9), ("in", "¿cuánto sale?", 560, 760, 1.5), ("in", "¿cuánto sale?", 90, 990, 2.1)]),
    dict(n="02", titulo=["Responder", "lo", "mismo", "también", "es", "trabajo."], salto=3, tam=80,
         subs=[("Precios. Disponibilidad. Pedidos.", ""), ("Una y otra vez.", "otra,vez.")],
         graf=[("chip", "Precios", 60, 700, 0.8), ("chip", "Disponibilidad", 60, 800, 1.1), ("chip", "Pedidos", 60, 900, 1.4),
               ("badge", "12 sin responder", 600, 1010, 2.2)]),
    dict(n="03", titulo=["Conocé", "a", "Gipi."], salto=99,
         subs=[("Responde con tu catálogo", "catálogo"), ("y anota pedidos para que los confirmes.", "anota,pedidos")],
         graf=[("in", "¿Precio del combo?", 60, 680, 0.8), ("out", "¡Hola! Sale $4.500. ¿Te lo anoto?", 300, 900, 1.6),
               ("ok", "✓ Pedido anotado", 540, 1060, 2.6)]),
    dict(n="04", titulo=["Vos", "atendés.", "Gipi", "responde."], salto=2,
         subs=[("Vos seguís con lo tuyo.", ""), ("Gipi contesta en WhatsApp.", "WhatsApp.")],
         graf=[("in", "¿Tenés stock?", 60, 690, 0.8), ("out", "Sí, quedan 8. ¿Te reservo uno?", 340, 890, 1.5),
               ("in", "¡Dale!", 60, 1040, 2.4)]),
]

def escena(i, e):
    sid = f"s{i+1}"
    words = []
    for k, w in enumerate(e["titulo"]):
        br = "<br>" if k == e["salto"] else ""
        words.append(f'{br}<span id="{sid}-t{k}" class="tw">{w}</span>')
    title = " ".join(words).replace(" <br>", "<br>")
    graf_html, graf_js = [], []
    for k, (kind, text, x, y, t) in enumerate(e["graf"]):
        gid = f"{sid}-g{k}"
        graf_html.append(f'<div id="{gid}" class="g {kind}" style="left:{x}px;top:{y}px">{text}</div>')
        graf_js.append(f'tl.fromTo("#{gid}", {{opacity:0, scale:0.6, y:20}}, {{opacity:1, scale:1, y:0, duration:0.35, ease:"back.out(2.2)"}}, {t});')
        if kind == "badge":
            graf_js.append(f'tl.to("#{gid}", {{scale:1.08, duration:0.18, ease:"power2.out", yoyo:true, repeat:3}}, {t+0.45});')
    tw_js = "\n".join(
        f'tl.fromTo("#{sid}-t{k}", {{opacity:0, y:40}}, {{opacity:1, y:0, duration:0.35, ease:"power3.out"}}, {0.15 + 0.11*k:.2f});'
        for k in range(len(e["titulo"])))
    return f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; }}
    #{sid}-w {{ position: absolute; inset: 0; }}
    .cnt {{ position: absolute; right: 70px; top: 196px; font: 400 30px "DejaVu Sans"; color: #133C2F; }}
    .lbl {{ position: absolute; left: 62px; top: 290px; font: 700 30px "DejaVu Sans"; letter-spacing: 0.04em; color: #133C2F; }}
    .ttl {{ position: absolute; left: 58px; right: 60px; top: 345px; font: 700 92px/1.12 "DejaVu Sans"; color: #102A22; letter-spacing: -0.01em; }}
    .tw {{ display: inline-block; }}
    .gold {{ position: absolute; left: 62px; top: 600px; width: 96px; height: 10px; border-radius: 5px; background: #D1B15D; }}
    .g {{ position: absolute; font: 700 38px "DejaVu Sans"; padding: 22px 30px; border-radius: 30px; white-space: nowrap; box-shadow: 0 14px 30px rgba(16,42,34,0.12); }}
    .g.in {{ background: #FFFFFF; color: #102A22; border-bottom-left-radius: 8px; }}
    .g.out {{ background: #133C2F; color: #F3EDE4; border-bottom-right-radius: 8px; font-weight: 400; font-size: 36px; }}
    .g.chip {{ background: #FFFFFF; color: #133C2F; border: 3px solid #133C2F; padding: 16px 28px; }}
    .g.badge {{ background: #D1B15D; color: #102A22; }}
    .g.ok {{ background: #F3EDE4; color: #133C2F; border: 4px solid #D1B15D; }}
  </style>
  <div id="root" data-composition-id="{sid}" data-width="1080" data-height="1920">
    <div id="{sid}-w">
      <div class="cnt">{e["n"]}/04</div>
      <div id="{sid}-lbl" class="lbl">CONSULTAS Y PEDIDOS</div>
      <div class="ttl" style="font-size:{e.get("tam",92)}px">{title}</div>
      <div id="{sid}-gold" class="gold"></div>
      {"".join(graf_html)}
    </div>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {"" if i==0 else f'tl.fromTo("#{sid}-lbl", {{opacity:0}}, {{opacity:1, duration:0.3}}, 0.05);'}
{"" if i==0 else tw_js}
    tl.fromTo("#{sid}-gold", {{scaleX:0, transformOrigin:"left center"}}, {{scaleX:1, duration:0.45, ease:"power3.out"}}, 0.6);
    {chr(10).join(graf_js)}
    tl.to("#{sid}-w", {{opacity:0, y:-30, duration:0.22, ease:"power2.in"}}, {D-0.24});
    window.__timelines["{sid}"] = tl;
  </script>
</template>
"""

# Subtítulos: un solo host con todos los grupos
grupos = []
for i, e in enumerate(ESCENAS):
    base = i * D
    franjas = [(1.0, 2.55), (2.65, 4.1)]
    for j, (texto, claves) in enumerate(e["subs"]):
        a, b = franjas[j]
        toks = texto.split()
        keys = set(claves.split(",")) if claves else set()
        total = sum(len(t) for t in toks)
        t = base + a
        ws = []
        for k, tok in enumerate(toks):
            wd = (b - a - 0.5) * len(tok) / total
            ws.append(dict(id=f"c{i}{j}w{k}", text=tok, start=round(t, 3), key=tok in keys))
            t += wd
        grupos.append(dict(id=f"c{i}{j}", open=round(base + a - 0.05, 3), close=round(base + b, 3), words=ws))

cap_html = "\n".join(
    f'    <div id="{g["id"]}" class="grp">' + " ".join(
        f'<span id="{w["id"]}" class="w{" k" if w["key"] else ""}">{w["text"]}</span>' for w in g["words"]) + "</div>"
    for g in grupos)
subtitulos = f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; }}
    .grp {{ position: absolute; left: 0; right: 0; top: 1190px; padding: 0 90px; text-align: center;
           font: 700 58px/1.25 "DejaVu Sans"; color: #133C2F; opacity: 0; overflow: visible; }}
    .w {{ display: inline-block; }}
    .w.k {{ background: #D1B15D; color: #102A22; padding: 0 12px; border-radius: 12px; }}
  </style>
  <div id="root" data-composition-id="subtitulos" data-width="1080" data-height="1920">
{cap_html}
  </div>
  <script>
    const G = {json.dumps(grupos, ensure_ascii=False)};
    const tl = gsap.timeline({{ paused: true }});
    G.forEach((g) => {{
      tl.set("#" + g.id, {{ opacity: 1, visibility: "visible" }}, g.open);
      g.words.forEach((w) => {{
        tl.fromTo("#" + w.id, {{ opacity: 0.2, y: 12 }}, {{ opacity: 1, y: 0, duration: 0.16, ease: "power3.out" }}, w.start);
      }});
      tl.to("#" + g.id, {{ opacity: 0, duration: 0.12, ease: "power2.in" }}, g.close - 0.12);
      tl.set("#" + g.id, {{ opacity: 0, visibility: "hidden" }}, g.close);
    }});
    window.__timelines["subtitulos"] = tl;
  </script>
</template>
"""

letras = "".join(f'<span id="cta-l{k}" class="lt">{c}</span>' for k, c in enumerate("VENTAS"))
cta = f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; }}
    #cta-bg {{ position: absolute; inset: 0; background: #133C2F; }}
    #cta-logo {{ position: absolute; left: 0; right: 0; top: 230px; text-align: center; font: 700 44px "DejaVu Sans"; color: #F3EDE4; }}
    #cta-logo img {{ width: 70px; height: 70px; border-radius: 16px; vertical-align: middle; margin-right: 18px; }}
    #cta-h {{ position: absolute; left: 0; right: 0; top: 470px; text-align: center; font: 700 104px/1.1 "DejaVu Sans"; color: #F3EDE4; }}
    #cta-box {{ position: absolute; left: 90px; width: 900px; top: 700px; height: 150px; border-radius: 75px; background: #F3EDE4; }}
    #cta-txt {{ position: absolute; left: 60px; top: 0; height: 150px; display: flex; align-items: center; font: 700 76px "DejaVu Sans"; color: #133C2F; letter-spacing: 0.06em; }}
    .lt {{ display: inline-block; }}
    #cta-send {{ position: absolute; right: 18px; top: 18px; width: 114px; height: 114px; border-radius: 57px; background: #D1B15D;
                color: #102A22; font: 700 56px/114px "DejaVu Sans"; text-align: center; }}
    #cta-sub {{ position: absolute; left: 0; right: 0; top: 920px; text-align: center; font: 700 64px "DejaVu Sans"; color: #D1B15D; }}
    #cta-gipi {{ position: absolute; left: 400px; top: 1015px; width: 280px; height: 280px; border-radius: 140px; background: #F3EDE4; overflow: hidden; border: 6px solid #D1B15D; }}
    #cta-gipi img {{ position: absolute; left: -45px; top: 8px; width: 360px; display: block; }}
    #cta-foot {{ position: absolute; left: 0; right: 0; top: 1312px; text-align: center; font: 400 34px "DejaVu Sans"; color: #F3EDE4; opacity: 0.85; }}
  </style>
  <div id="root" data-composition-id="cta" data-width="1080" data-height="1920">
    <div id="cta-bg"></div>
    <div id="cta-logo"><img src="assets/img/logo.png" alt="">Changared IA</div>
    <div id="cta-h">Escribinos</div>
    <div id="cta-box"><div id="cta-txt">{letras}</div><div id="cta-send">➤</div></div>
    <div id="cta-sub">por privado</div>
    <div id="cta-gipi"><img src="assets/img/gipi.png" alt=""></div>
    <div id="cta-foot">Gipi · Tu equipo virtual en WhatsApp</div>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    tl.fromTo("#cta-bg", {{ yPercent: 100 }}, {{ yPercent: 0, duration: 0.45, ease: "power4.out" }}, 0);
    tl.fromTo("#cta-logo", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, 0.3);
    tl.fromTo("#cta-h", {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }}, 0.35);
    tl.fromTo("#cta-box", {{ opacity: 0, scale: 0.85 }}, {{ opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }}, 0.6);
    for (let k = 0; k < 6; k++) tl.fromTo("#cta-l" + k, {{ opacity: 0 }}, {{ opacity: 1, duration: 0.01 }}, 1.0 + k * 0.12);
    tl.fromTo("#cta-send", {{ scale: 1 }}, {{ scale: 1.18, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }}, 1.85);
    tl.fromTo("#cta-sub", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }}, 1.4);
    tl.fromTo("#cta-gipi", {{ opacity: 0, y: 60 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }}, 0.7);
    tl.fromTo("#cta-foot", {{ opacity: 0 }}, {{ opacity: 0.85, duration: 0.4 }}, 1.6);
    window.__timelines["cta"] = tl;
  </script>
</template>
"""

hosts = []
for i in range(4):
    sid = f"s{i+1}"
    hosts.append(f'''      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{i*D:.2f}" data-duration="{D}" data-track-index="2" data-track-kind="graphics" data-width="1080" data-height="1920"></div>''')

index = f"""<!doctype html>
<html lang="es" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/js/gsap.min.js"></script>
    <style>
      {FONT}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #F3EDE4; }}
      #root {{ position: relative; width: 100%; height: 100%; font-family: "DejaVu Sans", sans-serif; }}
      #barra {{ position: absolute; left: 0; right: 0; top: 0; height: 14px; background: #133C2F; }}
      #marca {{ position: absolute; left: 62px; top: 176px; font: 700 40px/70px "DejaVu Sans"; color: #133C2F; }}
      #marca img {{ width: 70px; height: 70px; border-radius: 16px; vertical-align: top; margin-right: 20px; }}
      #gipi {{ position: absolute; left: 290px; top: 650px; width: 540px; z-index: 1; }}
      #gipi-in {{ width: 540px; }}
      #gipi-in img {{ width: 540px; display: block; -webkit-mask-image: linear-gradient(to bottom, #000 82%, transparent 100%); mask-image: linear-gradient(to bottom, #000 82%, transparent 100%); }}
      #s1, #s2, #s3, #s4 {{ z-index: 2; }}
      #subtitulos {{ z-index: 3; }}
      #cta {{ z-index: 5; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
      <div id="barra" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="0"></div>
      <div id="marca" class="clip" data-start="0" data-duration="{4*D}" data-track-index="1"><img src="assets/img/logo.png" alt="">Changared IA</div>
      <div id="gipi" class="clip" data-start="0" data-duration="{4*D}" data-track-index="1"><div id="gipi-in"><img src="assets/img/gipi.png" alt="Gipi"></div></div>
{chr(10).join(hosts)}
      <div id="subtitulos" data-composition-id="subtitulos" data-composition-src="compositions/subtitulos.html" data-start="0" data-duration="{4*D}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920"></div>
      <div id="cta" data-composition-id="cta" data-composition-src="compositions/cta.html" data-start="{4*D:.2f}" data-duration="{CTA}" data-track-index="4" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      tl.fromTo("#gipi-in", {{ scale: 0.96 }}, {{ scale: 1, duration: 0.6, ease: "power3.out" }}, 0);
      // respiración suave de Gipi (número fijo de ciclos, nada infinito)
      tl.to("#gipi-in", {{ y: -12, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: 13 }}, 0.8);
      // "Conocé a Gipi": se acerca un poco
      tl.to("#gipi-in", {{ scale: 1.1, duration: 0.5, ease: "power3.out" }}, {2*D + 0.1});
      tl.to("#gipi-in", {{ scale: 1, duration: 0.4, ease: "power2.inOut" }}, {3*D - 0.1});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""

os.makedirs(f"{P}/compositions", exist_ok=True)
open(f"{P}/index.html", "w", encoding="utf-8").write(index)
for i, e in enumerate(ESCENAS):
    open(f"{P}/compositions/s{i+1}.html", "w", encoding="utf-8").write(escena(i, e))
open(f"{P}/compositions/subtitulos.html", "w", encoding="utf-8").write(subtitulos)
open(f"{P}/compositions/cta.html", "w", encoding="utf-8").write(cta)
print("total", TOTAL)
