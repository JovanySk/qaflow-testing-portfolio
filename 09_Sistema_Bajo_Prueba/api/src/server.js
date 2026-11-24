import { app } from "./app.js";
import { config } from "./config.js";
import { closeDatabase, initializeDatabase } from "./db.js";

let server;

async function shutdown(signal) {
  console.log(`[QAFlow] Señal ${signal} recibida. Cerrando servicio...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDatabase();
  process.exit(0);
}

try {
  await initializeDatabase();
  server = app.listen(config.port, "127.0.0.1", () => {
    console.log(`[QAFlow] API y web disponibles en http://127.0.0.1:${config.port}`);
    console.log(`[QAFlow] MySQL conectado en ${config.database.host}:${config.database.port}/${config.database.name}`);
  });
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (error) {
  console.error(`[QAFlow] No fue posible iniciar: ${error.message}`);
  process.exit(1);
}
