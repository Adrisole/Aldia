import cors from "cors";
import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(authRouter);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`AlDía backend escuchando en el puerto ${PORT}`);
});
