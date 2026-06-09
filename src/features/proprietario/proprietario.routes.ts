import { Router } from "express";
import { body } from "express-validator";
import { cpf as validarCPF, cnpj as validarCNPJ } from "cpf-cnpj-validator";
import exigeLogin from "../../shared/middlewares/exigeLogin";
//import AuthRepository from "../auth/auth.repository";
import ProprietarioRepository from "./proprietario.repository";
import ProprietarioService from "./proprietario.service";
import ProprietarioController from "./proprietario.controller";
import { prisma } from "../../shared/config/database";
const router = Router();

//const authRepo = new AuthRepository(prisma);
const proprietarioRepo = new ProprietarioRepository(prisma);
const proprietarioService = new ProprietarioService(proprietarioRepo);
const proprietarioController = new ProprietarioController(proprietarioService);


// --- DEFINIÇÃO DAS ROTAS ---

router.post(
  "/",
  [
    // Validações Base (Credenciais)
    body("email").isEmail().withMessage("O email informado não é válido"),
    body("telefone")
      .matches(/^(\d{10,11}|\(\d{2}\) \s?\d{4,5}-\d{4})$/)
      .withMessage("O telefone deve conter 10 ou 11 dígitos, com ou sem máscara."),
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

router.put(
  "/:id",
  exigeLogin(),
  [
    body("email").optional().isEmail().withMessage("Email inválido"),
    body("telefone").optional().matches(/^(\d{10,11}|\(\d{2}\) \s?\d{4,5}-\d{4})$/).withMessage("Telefone inválido"),
    body("senha").optional().isLength({ min: 8 }).withMessage("Senha deve ter 8 caracteres"),
    body("nome").optional().notEmpty().withMessage("O nome não pode ser vazio"),
    body("razaoSocial").optional().notEmpty().withMessage("A Razão Social não pode ser vazia"),
    body("nomeFantasia").optional().notEmpty().withMessage("O Nome Fantasia não pode ser vazio")
  ],
  proprietarioController.atualizar.bind(proprietarioController)
);

router.put(
  "/:id/endereco",
  exigeLogin(),
  [
    body("cidade").notEmpty().withMessage("Cidade é obrigatória"),
    body("CEP").matches(/^\d{5}-\d{3}$/).withMessage("CEP inválido"),
    body("UF").isLength({ min: 2, max: 2 }).withMessage("UF deve ter 2 caracteres"),
    body("logradouro").notEmpty().withMessage("Logradouro é obrigatório")
  ],
  proprietarioController.atualizarEndereco.bind(proprietarioController)
);

// Adicionar endereço para um proprietário existente
router.post(
  "/:id/endereco",
  exigeLogin(),
  [
    body("cidade").notEmpty().withMessage("Cidade é obrigatória"),
    body("bairro").notEmpty().withMessage("Bairro é obrigatório"),
    body("CEP").matches(/^\d{5}-\d{3}$/).withMessage("CEP deve estar no formato 00000-000"),
    body("UF").isLength({ min: 2, max: 2 }).withMessage("UF deve ter 2 caracteres"),
    body("logradouro").notEmpty().withMessage("Logradouro é obrigatório")
  ],
  proprietarioController.criarEndereco.bind(proprietarioController)
);

// Remover endereço de um proprietário
router.delete(
  "/:id/endereco/:enderecoId",
  exigeLogin(),
  proprietarioController.removerEndereco.bind(proprietarioController)
);

router.delete(
  "/:id",
  exigeLogin(),
  proprietarioController.excluir.bind(proprietarioController)
);

export default router;