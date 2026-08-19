import http from "http";
import { Socket } from "net";
import { Request, Response } from "express";
import app from "./app";
import { sessMiddleware } from "./shared/middlewares/sessao";
import { testarConexao } from "./shared/config/database";
import setupSwagger from './swagger';
import { GerenciadorWebSocket, RequisicaoComSessao } from './shared/websocket/websocket.manager';
import { iniciarCronJobs } from './shared/cron/cron.service';

const PORT = process.env.PORT || 3333;

async function iniciarServidor(): Promise<void> {
  await testarConexao();
  
  setupSwagger(app);

  const server = http.createServer(app);

  const wsManager = GerenciadorWebSocket.obterInstancia();
  wsManager.inicializar();

  server.on('upgrade', (request: RequisicaoComSessao, socket: Socket, head: Buffer) => {
    const req = request as Request;
    const res = {} as Response;

    sessMiddleware(req, res, () => {
      const reqComSessao = request;

      if (!reqComSessao.session || !reqComSessao.session.idUsuario) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      if (wsManager.wss) {
        wsManager.wss.handleUpgrade(request, socket, head, (ws) => {
          wsManager.wss?.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  });

  iniciarCronJobs();

  server.listen(PORT, () => {
    console.log(`Servidor HTTP e WebSocket rodando em http://localhost:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

iniciarServidor().catch((error: unknown) => {
  console.error("Falha fatal ao iniciar o servidor:", error);
  process.exit(1);
});