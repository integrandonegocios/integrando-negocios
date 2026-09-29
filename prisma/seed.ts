import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { provisionInitialData } from "./bootstrap";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não está configurada.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

const scrypt = promisify(scryptCallback);

async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${hash.toString("hex")}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if ((email && !password) || (!email && password)) throw new Error("Informe ADMIN_EMAIL e ADMIN_PASSWORD juntos.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL inválido.");
  if (password && (password.length < 12 || password.length > 128)) throw new Error("ADMIN_PASSWORD deve ter de 12 a 128 caracteres.");
  const hash = password ? await passwordHash(password) : undefined;
  const result = await provisionInitialData(db, email && hash ? { email, hash, name: process.env.ADMIN_NAME?.trim() } : undefined);
  console.log(result);
}

main()
  .catch(() => {
    console.error("Falha no provisionamento inicial. Verifique a configuração e a conexão com o banco.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });