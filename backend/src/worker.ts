import "dotenv/config";
import { iniciarCronVencimientos, procesarVencimientosDeHoy } from "./jobs/cronVencimientos";
import { iniciarSecuenciaWorker } from "./workers/secuenciaWorker";

iniciarSecuenciaWorker();
iniciarCronVencimientos();

// Corre una vez al arrancar para no esperar hasta las 9:00 si ya hay deudas vencidas sin procesar.
procesarVencimientosDeHoy()
  .then((n) => console.log(`Vencimientos procesados al arrancar: ${n}`))
  .catch((e) => console.error("Error procesando vencimientos al arrancar:", e));

console.log("Worker de secuencias y cron de vencimientos corriendo...");
