import dotenv from "dotenv";
import mysql, { Pool } from "mysql2/promise";

dotenv.config();

export const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Função utilitária para testar a conexão quando o servidor iniciar
export async function testarConexao(): Promise<void> {
  try {
    const conexao = await pool.getConnection();
    console.log("Conexão com o MySQL estabelecida com sucesso!");
    conexao.release();
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
    process.exit(1); // Derruba a aplicação se não tiver banco
  }
}