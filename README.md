# Aldia
Sistemas de cobros

## Backend (Fase 1 + 2)

```bash
docker compose up -d          # Postgres + Redis
cd backend
cp .env.example .env
npm install
npm run prisma:migrate        # crea el esquema (§4 de la spec)
npm run db:seed               # carga los datos de demostración del prototipo
npm run dev                   # http://localhost:3000
```

Usuarios de prueba (seed): `admin@energiafitness.com.ar` y `admin@delvallepropiedades.com.ar`, password `aldia1234`.

Endpoints disponibles (Fase 2, ver §9 de la spec): `clientes`, `deudas` (con `pausar`/`reanudar`/`pago-manual`/`mensajes`), `cobros` y `config`. Quedan para fases siguientes: OAuth y webhook de Mercado Pago (Fase 4), WhatsApp Cloud API (Fase 5), y `generar-mes`/importación CSV (Fase 7).

## Frontend (Fase 2)

Panel real conectado a la API (reemplaza los datos estáticos del prototipo). El selector Gimnasio/Inmobiliaria del prototipo no se migró: cada tenant ve solo su propio negocio (principio #1 de la spec), así que ese selector era una licencia de la demo.

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173 (proxy /api -> backend :3000)
```

El archivo `frontend/aldia-prototipo.jsx` se conserva como referencia de diseño (no forma parte del build de Vite).
