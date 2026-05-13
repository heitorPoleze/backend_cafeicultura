import { Router } from "express";
import { body } from "express-validator";
import { cpf as validarCPF, cnpj as validarCNPJ } from "cpf-cnpj-validator";
import { pool } from "../../shared/config/database";
import exigeLogin from "../../shared/middlewares/exigeLogin";

import AuthRepository from "../auth/auth.repository";
import ProprietarioRepository from "./proprietario.repository";
import ProprietarioService from "./proprietario.service";
import ProprietarioController from "./proprietario.controller";

const router = Router();

const authRepo = new AuthRepository(pool);
const proprietarioRepo = new ProprietarioRepository(pool, authRepo);
const proprietarioService = new ProprietarioService(proprietarioRepo);
const proprietarioController = new ProprietarioController(proprietarioService);


// --- DEFINIÇÃO DAS ROTAS ---

router.post(
  "/",
  [
    // Validações Base (Credenciais)
    body("email").isEmail().withMessage("O email informado não é válido"),
    body("telefone")
      .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/)
      .withMessage("O formato do telefone deve ser (XX) XXXXX-XXXX ou (XX) XXXX-XXXX."),
    body("senha")
      .isLength({ min: 8 }).withMessage("A senha deve conter pelo menos 8 caracteres")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
      .withMessage("A senha deve conter maiúscula, minúscula, número e símbolo"),
    
    // Validação de Tipo de Perfil
    body("tipoPessoa").isIn(['fisica', 'juridica']).withMessage("O tipoPessoa deve ser fisica ou juridica"),

    // Validações Condicionais (Pessoa Física)
    body("nome").if(body("tipoPessoa").equals("fisica")).notEmpty().withMessage("O nome é obrigatório para Pessoa Física"),
    body("cpf").if(body("tipoPessoa").equals("fisica")).custom((value) => validarCPF.isValid(value)).withMessage("O CPF informado é inválido"),

    // Validações Condicionais (Pessoa Jurídica)
    body("razaoSocial").if(body("tipoPessoa").equals("juridica")).notEmpty().withMessage("A Razão Social é obrigatória para Pessoa Jurídica"),
    body("cnpj").if(body("tipoPessoa").equals("juridica")).custom((value) => validarCNPJ.isValid(value)).withMessage("O CNPJ informado é inválido"),
    body("inscrEstadual").if(body("tipoPessoa").equals("juridica")).optional()
  ],
  proprietarioController.cadastrar.bind(proprietarioController)
);

router.get(
  "/:id",
  exigeLogin(),
  proprietarioController.buscarPorId.bind(proprietarioController)
);

export default router;