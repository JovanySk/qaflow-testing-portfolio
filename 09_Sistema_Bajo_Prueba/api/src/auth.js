import crypto from "node:crypto";
import { promisify } from "node:util";
import { config } from "./config.js";

const scrypt = promisify(crypto.scrypt);
const sessions = new Map();

export async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = await scrypt(password, salt, 64);
  return { salt, hash: Buffer.from(derivedKey).toString("hex") };
}

export async function passwordMatches(password, salt, expectedHash) {
  const { hash } = await hashPassword(password, salt);
  const actual = Buffer.from(hash, "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function issueToken(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    user: { id: user.id, username: user.username, role: user.role },
    expiresAt: Date.now() + config.auth.tokenTtlMs,
  });
  return token;
}

export function revokeToken(token) {
  sessions.delete(token);
}

export function requireAuth(req, res, next) {
  const authorization = req.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");
  const session = scheme === "Bearer" && token ? sessions.get(token) : null;

  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Token ausente, inválido o expirado." },
    });
  }

  req.authToken = token;
  req.user = session.user;
  return next();
}
