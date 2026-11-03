#!/usr/bin/env bash
# Prepara la máquina para la skill video-editor. Si algo ya está, lo saltea.
# Nunca usa sudo por su cuenta: si hace falta, avisa y se detiene.
set -u
ok(){ echo "✓ $1"; }; falta(){ echo "→ $1"; }
SO="$(uname)"

instalar_sistema(){ # $1 = paquete
  if [ "$SO" = "Darwin" ]; then
    command -v brew >/dev/null || { echo "Falta Homebrew (https://brew.sh). Pide contraseña: preguntale a la directora antes."; return 1; }
    brew install "$1"
  elif [ "$(id -u)" = "0" ]; then
    apt-get update -q >/dev/null 2>&1; apt-get install -y -q "$1"
  else
    echo "Instalar $1 necesita sudo (pide contraseña). Preguntale a la directora antes de seguir."; return 1
  fi
}

command -v ffmpeg >/dev/null && ok "FFmpeg" || { falta "Instalando FFmpeg (corta, une y exporta el video)"; instalar_sistema ffmpeg; }
command -v node >/dev/null && ok "Node.js $(node -v)" || { falta "Instalando Node.js (lo necesita HyperFrames para gráficos)"; instalar_sistema node || instalar_sistema nodejs; }
command -v whisper >/dev/null && ok "Whisper" || { falta "Instalando Whisper (transcribe cada palabra con su tiempo)"; python3 -m pip install -q openai-whisper || pip3 install -q openai-whisper; }
command -v espeak-ng >/dev/null || command -v say >/dev/null && ok "Voz sintética (para pruebas)" || { falta "Instalando espeak-ng (voz para pruebas)"; instalar_sistema espeak-ng; }

# Skills de HyperFrames: vienen copiadas junto a esta skill; si no están en ningún lado, se instalan.
if ls ~/.claude/skills/hyperframes >/dev/null 2>&1 || ls "$(dirname "$0")/../../hyperframes" >/dev/null 2>&1; then
  ok "Skills de HyperFrames"
else
  falta "Instalando skills de HyperFrames"; CI=1 npx -y hyperframes skills update
fi

# Modelo de Whisper: probar que se puede bajar (algunas redes lo bloquean).
if command -v whisper >/dev/null; then
  python3 -c "import whisper; whisper.load_model('small')" >/dev/null 2>&1 \
    && ok "Modelo de Whisper 'small' listo" \
    || echo "✗ No se pudo bajar el modelo de Whisper: la red bloquea openaipublic.azureedge.net. Pedir que lo habiliten."
fi
