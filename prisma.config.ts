// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "dotenv/config";

// Importa a função do Prisma que habilita o autocompletar e valida os tipos
import { defineConfig } from "prisma/config";

export default defineConfig({
  //onde está no repositório o modelo do banco de dados
  schema: "prisma/schema.prisma",
  //onde os arquivos de histórico (SQL gerado) serão salvos e lidos
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
