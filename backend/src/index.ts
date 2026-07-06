import cors from "cors";
import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth";
import { clientesRouter } from "./routes/clientes";
import { cobrosRouter } from "./routes/cobros";
import { configRouter } from "./routes/config";
import { deudasRouter } from "./routes/deudas";
import { metricasRouter } from "./routes/metricas";
import { mpOauthRouter } from "./routes/mpOauth";
import { mpWebhookRouter } from "./routes/mpWebhook";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(authRouter);
app.use(mpOauthRouter);
app.use(mpWebhookRouter);
app.use("/clientes", clientesRouter);
app.use("/deudas", deudasRouter);
app.use("/cobros", cobrosRouter);
app.use("/metricas", metricasRouter);
app.use("/config", configRouter);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`AlDía backend escuchando en el puerto ${PORT}`);
});
