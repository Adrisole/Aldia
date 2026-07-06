import cors from "cors";
import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth";
import { clientesRouter } from "./routes/clientes";
import { cobrosRouter } from "./routes/cobros";
import { configRouter } from "./routes/config";
import { deudasRouter } from "./routes/deudas";
import { metricasRouter } from "./routes/metricas";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(authRouter);
app.use(clientesRouter);
app.use(deudasRouter);
app.use(cobrosRouter);
app.use(metricasRouter);
app.use(configRouter);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`AlDía backend escuchando en el puerto ${PORT}`);
});
