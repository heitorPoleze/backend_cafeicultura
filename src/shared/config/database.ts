import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cafeicultura",
  connectionLimit: 20,
  allowPublicKeyRetrieval: true
});

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  errorFormat: "pretty",
  adapter: adapter,
  transactionOptions: {
    maxWait: 10000,
    timeout: 20000,
  },
});

export async function testarConexao(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("Conexão com o banco de dados estabelecida com sucesso pelo Prisma");
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
    process.exit(1); // Derruba a aplicação se não tiver banco
  }
}