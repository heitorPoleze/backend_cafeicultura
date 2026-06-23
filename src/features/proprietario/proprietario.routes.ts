import { Router } from "express";
import { body } from "express-validator";
import { cpf as validarCPF, cnpj as validarCNPJ } from "cpf-cnpj-validator";
import exigeLogin from "../../shared/middlewares/exigeLogin";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import UsuarioRepository from "../usuario/usuario.repository";
import ProprietarioRepository from "./proprietario.repository";
import ProprietarioService from "./proprietario.service";
import ProprietarioController from "./proprietario.controller";
import { prisma } from "../../shared/config/database";
const router = Router();

const pessoaRepo = new PessoaRepository(prisma);
const usuarioRepo = new UsuarioRepository(prisma);
const proprietarioRepo = new ProprietarioRepository(prisma, pessoaRepo, usuarioRepo);
const proprietarioService = new ProprietarioService(proprietarioRepo, pessoaRepo, usuarioRepo);
const proprietarioController = new ProprietarioController(proprietarioService);


// --- DEFINIÇÃO DAS ROTAS ---

router.post(
  "/",
  [
    // Validações Base (usuário)
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
//revisar
// Atualizar senha de um proprietário
router.put(
  "/:id/senha",
  exigeLogin(),
  [
    body("senha")
      .isLength({ min: 8 }).withMessage("A senha deve conter pelo menos 8 caracteres")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
      .withMessage("A senha deve conter maiúscula, minúscula, número e símbolo")
  ],
  proprietarioController.atualizarSenha.bind(proprietarioController)
);
//revisar
// Atualizar email de um proprietário
router.put(
  "/:id/email",
  exigeLogin(),
  [
    body("email").isEmail().withMessage("O email informado não é válido")
  ],
  proprietarioController.atualizarEmail.bind(proprietarioController)
);
//revisar
// Atualizar telefone de um proprietário
router.put(
  "/:id/telefone",
  exigeLogin(),
  [
    body("telefone")
      .matches(/^(\d{10,11}|\(\d{2}\) \s?\d{4,5}-\d{4})$/)
      .withMessage("O telefone deve conter 10 ou 11 dígitos, com ou sem máscara.")
  ],
  proprietarioController.atualizarTelefone.bind(proprietarioController)
);

export default router;