import { Request, Response } from "express";
import { validationResult } from "express-validator";
import AuthService from "./auth.service";
import { LoginRequestDTO, LoginResponseDTO } from "./auth.dto";

class AuthController {
  constructor(private authService: AuthService) {}

  public async autenticar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const dto: LoginRequestDTO = req.body;

    try {
      const dadosSessao = await this.authService.autenticar(
        dto.entrada,
        dto.senha,
        dto.tipoEntrada,
      );

      req.session.idUsuario = dadosSessao.idUsuario;
      req.session.nome = dadosSessao.nome;

      const resposta: LoginResponseDTO = {
        mensagem: "Login efetuado com sucesso!",
        sessaoAtiva: dadosSessao,
      };

      res.status(200).json(resposta);
    } catch (error: any) {
      res.status(401).json({ mensagem: error.message });
    }
  }

  public logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ mensagem: "Erro ao encerrar sessão" });
        return;
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ mensagem: "Logout realizado com sucesso" });
    });
  };
}

export default AuthController;