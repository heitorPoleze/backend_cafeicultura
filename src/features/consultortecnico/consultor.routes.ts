import { Router } from "express";
import { body } from "express-validator";
import { cpf as validarCPF } from "cpf-cnpj-validator";
import { pool } from "../../shared/config/database";
import AuthRepository from "../auth/auth.repository";
import ConsultorTecnicoRepository from "./consultor.repository";
import ConsultorTecnicoService from "./consultor.service";
import ConsultorTecnicoController from "./consultor.controller";

const router = Router();

const authRepo = new AuthRepository(pool);
const consultorRepo = new ConsultorTecnicoRepository(pool, authRepo);
const consultorService = new ConsultorTecnicoService(consultorRepo);
const consultorController = new ConsultorTecnicoController(consultorService);

router.post(
  "/",
  [
    body("email").isEmail().withMessage("O email informado não é válido"),
    body("telefone").matches(/^\(\d{2}\) \d{4,5}-\d{4}$/).withMessage("Formato do telefone deve ser (XX) XXXXX-XXXX"),
    body("senha")
      .isLength({ min: 8 }).withMessage("Pelo menos 8 caracteres")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
      .withMessage("A senha deve conter maiúscula, minúscula, número e símbolo"),
    body("nome").notEmpty().withMessage("O nome deve ser preenchido"),
    body("cpf")
      .notEmpty().withMessage("O campo CPF deve ser preenchido")
      .custom((value) => validarCPF.isValid(value)).withMessage("O CPF informado é inválido"),
  ],
  consultorController.cadastrar.bind(consultorController)
);

export default router;