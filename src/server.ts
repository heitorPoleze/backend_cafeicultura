import app from "./app";
import { testarConexao } from "./shared/config/database";

const PORT = process.env.PORT || 3333;

async function iniciarServidor() {
  // 1. Testa o banco antes de liberar o acesso à API
  await testarConexao();

  // 2. Inicia o servidor HTTP
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

iniciarServidor();