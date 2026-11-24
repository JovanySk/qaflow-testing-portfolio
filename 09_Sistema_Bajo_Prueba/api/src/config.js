import dotenv from "dotenv";

dotenv.config({ quiet: true });

function positiveInteger(value, fallback, label) {
  const parsed = Number.parseInt(value ?? fallback, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} debe ser un entero positivo.`);
  }
  return parsed;
}

const databaseName = process.env.DB_NAME ?? "qaflow_sut";
if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
  throw new Error("DB_NAME solo puede contener letras, números y guion bajo.");
}

export const config = Object.freeze({
  port: positiveInteger(process.env.PORT, 3000, "PORT"),
  database: Object.freeze({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: positiveInteger(process.env.DB_PORT, 3306, "DB_PORT"),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    name: databaseName,
  }),
  auth: Object.freeze({
    tokenTtlMs: positiveInteger(process.env.TOKEN_TTL_MINUTES, 120, "TOKEN_TTL_MINUTES") * 60_000,
  }),
  seed: Object.freeze({
    username: process.env.SEED_ADMIN_USERNAME ?? "qa.admin",
    password: process.env.SEED_ADMIN_PASSWORD ?? "QaflowDemo#2026",
  }),
});
