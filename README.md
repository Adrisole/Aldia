# Aldia
Sistemas de cobros

## Backend (Fase 1)

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
