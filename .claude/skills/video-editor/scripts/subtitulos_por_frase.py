import sys, json, re
tsv, out = sys.argv[1], sys.argv[2]
KEY = {"deben", "whatsapp", "plata", "aldía"}
groups, words = [], []
for gi, line in enumerate(open(tsv, encoding="utf-8")):
    s, d, text = line.rstrip("\n").split("\t")
    s, d = float(s), float(d)
    toks = text.split()
    total = sum(len(t) for t in toks)
    t = s
    ws = []
    for wi, tok in enumerate(toks):
        wd = d * len(tok) / total
        ws.append({"id": f"w{gi}_{wi}", "text": tok, "start": round(t, 3), "end": round(t + wd, 3),
                   "key": re.sub(r"[^\wí]", "", tok.lower()) in KEY})
        t += wd
    groups.append({"id": f"g{gi}", "start": s, "end": s + d, "words": ws})
# cada grupo abre 0.05 s antes de su primera palabra y cierra cuando empieza el siguiente (o +0.35 s)
for g in groups:
    g["open"] = round(max(0.1, g["start"] - 0.05), 3)
for i, g in enumerate(groups):
    g["close"] = round(groups[i + 1]["open"] if i + 1 < len(groups) else g["end"] + 0.35, 3)
html = []
for g in groups:
    spans = "".join(f'<span id="{w["id"]}" class="w{" k" if w["key"] else ""}">{w["text"]}</span> ' for w in g["words"])
    html.append(f'    <div id="{g["id"]}" class="grp">{spans.strip()}</div>')
js = json.dumps(groups, ensure_ascii=False)
tpl = open(out, encoding="utf-8").read()
open(out, "w", encoding="utf-8").write(tpl.replace("<!--GROUPS-->", "\n".join(html)).replace("/*DATA*/[]", js))
print("fin", groups[-1]["close"])
