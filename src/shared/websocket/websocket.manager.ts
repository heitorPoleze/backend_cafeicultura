import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { NotificacaoResponseDTO } from '../../features/notificacao/notificacao.dto';

export type RequisicaoComSessao = IncomingMessage & {
  session: {
    idUsuario: number;
  };
}

export class GerenciadorWebSocket {
  private static instancia: GerenciadorWebSocket;
  
  private clientes: Map<number, WebSocket> = new Map();

  private constructor() {}

  public static obterInstancia(): GerenciadorWebSocket {
    if (!GerenciadorWebSocket.instancia) {
      GerenciadorWebSocket.instancia = new GerenciadorWebSocket();
    }
    return GerenciadorWebSocket.instancia;
  }

  public inicializar(): void {
    const wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws: WebSocket, req: RequisicaoComSessao) => {
      const requisicao = req;
      const idUsuario = requisicao.session.idUsuario;

      if (idUsuario) {
        this.clientes.set(idUsuario, ws);
        
        ws.on('close', () => {
          this.clientes.delete(idUsuario);
        });
      } else {
        ws.close(1008, 'ID do usuário é obrigatório');
      }
    });

    this.wss = wss; 
  }

  public wss?: WebSocketServer;

  public enviarParaUsuario(idUsuario: number, payload: NotificacaoResponseDTO): void {
    const ws = this.clientes.get(idUsuario);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      const mensagem = JSON.stringify(payload);
      ws.send(mensagem);
    }
  }
}