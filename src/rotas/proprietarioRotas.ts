import { Router } from "express";
import { body } from "express-validator";
import { cpf as validarCPF, cnpj as validarCNPJ } from "cpf-cnpj-validator";
import ProprietarioControle from "../controles/ProprietarioControle";
import exigeLogin from "../middlewares/exigeLogin";

const router = Router();
const proprietarioControle = new ProprietarioControle();

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
    
    body("tipoPessoa").isIn(['fisica', 'juridica']).withMessage("O tipoPessoa deve ser fisica ou juridica"),

    body("nome").if(body("tipoPessoa").equals("fisica")).notEmpty().withMessage("O nome é obrigatório para Pessoa Física"),
    body("cpf").if(body("tipoPessoa").equals("fisica")).custom((value) => validarCPF.isValid(value)).withMessage("O CPF informado é inválido"),

    body("razaoSocial").if(body("tipoPessoa").equals("juridica")).notEmpty().withMessage("A Razão Social é obrigatória para Pessoa Jurídica"),
    body("cnpj").if(body("tipoPessoa").equals("juridica")).custom((value) => validarCNPJ.isValid(value)).withMessage("O CNPJ informado é inválido"),
    body("inscrEstadual").if(body("tipoPessoa").equals("juridica")).optional()
  ],
  proprietarioControle.cadastrar.bind(proprietarioControle)
);

router.get(
  "/",
  exigeLogin(),
  proprietarioControle.listarOuBuscar.bind(proprietarioControle)
);

router.get(
  "/:id",
  exigeLogin(),
  proprietarioControle.buscarPorId.bind(proprietarioControle)
);

export default router;