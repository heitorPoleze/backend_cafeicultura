import { Router } from "express";
import { body } from "express-validator";
import { cpf as validarCPF } from "cpf-cnpj-validator";
import ConsultorTecnicoControle from "../controles/ConsultorTecnicoControle";
import exigeLogin from "../middlewares/exigeLogin";

const router = Router();
const consultorControle = new ConsultorTecnicoControle();

router.post(
  "/",
  [
    body("email").isEmail().withMessage("O email informado não é válido"),
    body("telefone")
      .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/)
      .withMessage("O formato do telefone deve ser (XX) XXXXX-XXXX ou (XX) XXXX-XXXX."),
    body("senha")
      .isLength({ min: 8 }).withMessage("A senha deve conter pelo menos 8 caracteres")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
      .withMessage("A senha deve conter maiúscula, minúscula, número e símbolo"),
    
    body("nome").notEmpty().withMessage("O nome deve ser preenchido"),
    body("cpf")
      .notEmpty().withMessage("O campo CPF deve ser preenchido")
      .custom((value) => validarCPF.isValid(value)).withMessage("O CPF informado é inválido"),
  ],
  consultorControle.cadastrar.bind(consultorControle)
);

router.get(
  "/",
  exigeLogin(),
  consultorControle.listarOuBuscar.bind(consultorControle)
);

router.get(
  "/:id",
  exigeLogin(),
  consultorControle.buscarPorId.bind(consultorControle)
);

export default router;