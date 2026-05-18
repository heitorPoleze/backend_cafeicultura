import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { pool } from "../../shared/config/database";
import AuthRepository from "./auth.repository";
import AuthService from "./auth.service";
import AuthController from "./auth.controller";
import exigeLogin from "../../shared/middlewares/exigeLogin";

const router = Router();

const authRepo = new AuthRepository(pool);
const authService = new AuthService(authRepo);
const authController = new AuthController(authService);

router.post(
  "/autenticar",
  [
    body("tipoEntrada").isIn(["email", "cpf", "cnpj"]).withMessage("Tipo de entrada inválido"),
    body("entrada").notEmpty().withMessage("Campo de login obrigatório"),
    body("senha").notEmpty().withMessage("Senha obrigatória"),
  ],
  authController.autenticar.bind(authController)
);

router.post(
  "/logout",
  exigeLogin(),
  authController.logout.bind(authController)
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