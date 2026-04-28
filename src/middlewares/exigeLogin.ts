import { Request, Response, NextFunction, RequestHandler } from "express";
import UsuarioServico from "../modelos/servicos/UsuarioServico";
import conexao from "../config/conexao";

export default function exigeLogin(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session?.idUsuario) {
      res.status(401).json({ mensagem: "Acesso não autorizado. Por favor, faça o login." });
      return;
    }

    try {
      const usuarioServico = new UsuarioServico(conexao);
      const status = await usuarioServico.verificarStatus(
        req.session.idUsuario
      );

      if (!status) {
        req.session.destroy((err) => {
          if (err) {
            // Se houver erro ao destruir a sessão, loga o erro mas continua
            console.error("Erro ao destruir a sessão:", err);
          }
          res.clearCookie("connect.sid"); // Limpa o cookie do navegador
          
          // Envia uma mensagem clara para o frontend
          res.status(403).json({ mensagem: `Sua conta foi desativada. Você foi desconectado.`});
        });
        return; // Importante para não chamar next()
      }
      
      // Se o status for 'Ativo', permite que a requisição continue
      next();
    } catch (err) {
      console.error("Erro no middleware exigeLogin:", err);
      res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
  };
}