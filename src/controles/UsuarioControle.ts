import { Request, Response } from "express";
import { validationResult } from "express-validator";
import UsuarioServico from "../modelos/servicos/UsuarioServico";
import PessoaFisica from "../modelos/entidades/PessoaFisica";
import PessoaJuridica from "../modelos/entidades/PessoaJuridica";
import conexao from "../config/conexao";

class UsuarioControle {
  private _usuarioServico: UsuarioServico;

  constructor() {
    this._usuarioServico = new UsuarioServico(conexao);
  }

  public async autenticar(req: Request, res: Response): Promise<void> {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      res.status(400).json({ erros: erros.array() });
      return;
    }

    try {
      const { entrada, senha, tipoEntrada } = req.body;

      const usuario = await this._usuarioServico.autenticar(entrada, senha, tipoEntrada);

      if (!usuario) {
        res.status(401).json({ mensagem: "Credenciais inválidas" });
        return;
      }

      req.session.regenerate((err) => {
        if (err) {
          console.error("Erro no regenerate:", err);
          return res.status(500).json({ mensagem: "Erro interno do servidor" });
        }

        const DEZ_ANOS_MS = 1000 * 60 * 60 * 24 * 365 * 10;
        req.session.cookie.maxAge =  DEZ_ANOS_MS;

        req.session.idUsuario = usuario.id;

        if (usuario.perfil instanceof PessoaFisica) {
            req.session.nome = usuario.perfil.nome;
        } else if (usuario.perfil instanceof PessoaJuridica) {
            req.session.nome = usuario.perfil.razaoSocial;
        }

        req.session.save((saveErr) => {
          if (saveErr) {
            res.status(500).json({ mensagem: "Erro interno do servidor" });
            return;
          }
          res.status(200).json({ mensagem: "Login realizado com sucesso" });
        });
      });
    } catch (error: any) {
      switch (error.message) {
        case "ERRO_USUARIO_NAO_ENCONTRADO" :
          res.status(404).json({ erros: [{ path: "entrada", msg: "O Usuário ou a Senha estão incorretos. Por favor, tente novamente." }] });
          break;
        case "ERRO_SENHA_INCORRETA":
          res.status(400).json({ erros: [{ path: "entrada", msg: "O Usuário ou a Senha estão incorretos. Por favor, tente novamente." }] });
          break;
        default:
          res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
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
  }
}

export default UsuarioControle;