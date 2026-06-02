import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function testarConexao(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("Conexão com o banco de dados estabelecida com sucesso pelo Prisma");
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
    process.exit(1); // Derruba a aplicação se não tiver banco
  }
}