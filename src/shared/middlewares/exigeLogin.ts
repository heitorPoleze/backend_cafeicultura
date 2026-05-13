import { Request, Response, NextFunction, RequestHandler } from "express";

export default function exigeLogin(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session?.idUsuario) {
      res.status(401).json({ mensagem: "Acesso não autorizado. Por favor, faça o login." });
      return;
    }

    try {
      next();
    } catch (err) {
      console.error("Erro no middleware exigeLogin:", err);
      res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
  };
}