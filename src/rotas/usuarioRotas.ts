import { Router, Request, Response } from "express";
import { body } from "express-validator";
import UsuarioControle from "../controles/UsuarioControle";
import exigeLogin from "../middlewares/exigeLogin";

const router = Router();

const usuarioControle = new UsuarioControle();

router.post(
  "/autenticar",
  [
    body("tipoEntrada")
      .notEmpty().withMessage("O tipo de entrada é obrigatório")
      .isIn(["email", "cpf", "cnpj"])
      .withMessage("O tipoEntrada deve ser 'email', 'cpf' ou 'cnpj'"),
    
    body("entrada")
      .notEmpty().withMessage("O campo de login (Email, CPF ou CNPJ) deve ser preenchido"),
    
    body("senha")
      .notEmpty().withMessage("O campo senha deve ser preenchido")
  ],
  usuarioControle.autenticar.bind(usuarioControle)
);

router.post(
  "/logout",
  exigeLogin(),
  usuarioControle.logout.bind(usuarioControle)
);

router.get(
  "/painel",
  exigeLogin(),
  (req: Request, res: Response) => {
    res.status(200).json({
      mensagem: "Acesso autorizado! Bem-vindo ao painel.",
      sessaoAtiva: {
        idUsuario: req.session.idUsuario,
        nome: req.session.nome
      }
    });
  }
);

export default router;