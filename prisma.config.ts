import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  //onde está no repositório o modelo do banco de dados
  schema: "prisma/schema.prisma",
  //onde os arquivos de histórico (SQL gerado) serão salvos e lidos
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "mysql://root:@localhost:3306/cafeicultura",
  },
});
