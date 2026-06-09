import { Request, Response } from "express";
import UsuarioService from "./usuario.service";

/**
 * Controller para gerenciar operações relacionadas ao Usuário.
 */
class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  /**
   * Retorna os dados do perfil do usuário logado baseado na sessão.
   */
  public async buscarMeuPerfil(req: Request, res: Response): Promise<void> {
    try {
      const idUsuario = req.session.idUsuario;

      if (!idUsuario) {
        res.status(401).json({ mensagem: "Sessão inválida ou expirada." });
        return;
      }

      const perfil = await this.usuarioService.obterPerfil(idUsuario);

      if (!perfil) {
        res.status(404).json({ mensagem: "Usuário não encontrado." });
        return;
      }

      res.status(200).json(perfil);
    } catch (error: unknown) {
      const mensagem = error instanceof Error ? error.message : "Erro interno ao buscar perfil.";
      res.status(500).json({ mensagem });
    }
  }
}

export default UsuarioController;