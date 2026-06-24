import { Request, Response } from "express";
import { validationResult } from "express-validator";
import AuthService from "./auth.service";
import { LoginRequestDTO, LoginResponseDTO, LogoutResponseDTO } from "./auth.dto";

class AuthController {
  constructor(private authService: AuthService) {}

  public async autenticar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };

    const dto: LoginRequestDTO = req.body;

    try {
      const dadosSessao = await this.authService.autenticar(
        dto.entrada,
        dto.senha,
        dto.tipoEntrada,
      );

      req.session.idUsuario = dadosSessao.idUsuario;
      req.session.nome = dadosSessao.nome;

      const resposta: LoginResponseDTO = { mensagem: "Login efetuado com sucesso!"};
      res.status(200).json(resposta);
    } catch (error: unknown) {
      const mensagem = error instanceof Error ? error.message : "Erro de autenticação";
      res.status(401).json({ error:mensagem });
    }
  }

  public logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Erro ao realizar logout. Tente novamente." });
        return;
      }
      res.clearCookie("connect.sid");
      const resposta: LogoutResponseDTO = { mensagem: "Logout realizado com sucesso" };
      res.status(200).json(resposta);
    });
  };
}

export default AuthController;