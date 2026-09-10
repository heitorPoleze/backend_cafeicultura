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
const proprietarioService = new ProprietarioService(prisma, proprietarioRepo, pessoaRepo, usuarioRepo);
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
    body("cpf").if(body("tipoPessoa").equals("fisica")).custom((value) => validarCPF.isValid(value, true)).withMessage("O CPF informado é inválido"),

    // Validações Condicionais (Pessoa Jurídica)
    body("razaoSocial").if(body("tipoPessoa").equals("juridica")).notEmpty().withMessage("A Razão Social é obrigatória para Pessoa Jurídica"),
    body("cnpj").if(body("tipoPessoa").equals("juridica")).custom((value) => validarCNPJ.isValid(value, true)).withMessage("O CNPJ informado é inválido"),
    body("inscrEstadual").if(body("tipoPessoa").equals("juridica")).optional()
  ],
  proprietarioController.cadastrar.bind(proprietarioController)
);

router.put(
  "/:id/endereco",
  exigeLogin(),
  [
    body(["cidade", "Cidade"]).custom((value, { req }) => {
      const cidade = value ?? req.body.cidade ?? req.body.Cidade;
      return typeof cidade === "string" && cidade.trim() !== "";
    }).withMessage("Cidade é obrigatória"),
    body(["bairro", "Bairro"]).custom((value, { req }) => {
      const bairro = value ?? req.body.bairro ?? req.body.Bairro;
      return typeof bairro === "string" && bairro.trim() !== "";
    }).withMessage("Bairro é obrigatório"),
    body(["CEP", "cep", "Cep"]).custom((value, { req }) => {
      const cep = value ?? req.body.CEP ?? req.body.cep ?? req.body.Cep;
      return typeof cep === "string" && /^\d{5}-\d{3}$/.test(cep);
    }).withMessage("CEP deve estar no formato 00000-000"),
    body(["UF", "uf", "Uf"]).custom((value, { req }) => {
      const uf = value ?? req.body.UF ?? req.body.uf ?? req.body.Uf;
      return typeof uf === "string" && uf.length === 2;
    }).withMessage("UF deve ter 2 caracteres"),
    body(["logradouro", "Logradouro"]).custom((value, { req }) => {
      const logradouro = value ?? req.body.logradouro ?? req.body.Logradouro;
      return typeof logradouro === "string" && logradouro.trim() !== "";
    }).withMessage("Logradouro é obrigatório")
  ],
  proprietarioController.atualizarEndereco.bind(proprietarioController)
);

// Adicionar endereço para um proprietário existente
router.post(
  "/:id/endereco",
  exigeLogin(),
  [
    body(["cidade", "Cidade"]).custom((value, { req }) => {
      const cidade = value ?? req.body.cidade ?? req.body.Cidade;
      return typeof cidade === "string" && cidade.trim() !== "";
    }).withMessage("Cidade é obrigatória"),
    body(["bairro", "Bairro"]).custom((value, { req }) => {
      const bairro = value ?? req.body.bairro ?? req.body.Bairro;
      return typeof bairro === "string" && bairro.trim() !== "";
    }).withMessage("Bairro é obrigatório"),
    body(["CEP", "cep", "Cep"]).custom((value, { req }) => {
      const cep = value ?? req.body.CEP ?? req.body.cep ?? req.body.Cep;
      return typeof cep === "string" && /^\d{5}-\d{3}$/.test(cep);
    }).withMessage("CEP deve estar no formato 00000-000"),
    body(["UF", "uf", "Uf"]).custom((value, { req }) => {
      const uf = value ?? req.body.UF ?? req.body.uf ?? req.body.Uf;
      return typeof uf === "string" && uf.length === 2;
    }).withMessage("UF deve ter 2 caracteres"),
    body(["logradouro", "Logradouro"]).custom((value, { req }) => {
      const logradouro = value ?? req.body.logradouro ?? req.body.Logradouro;
      return typeof logradouro === "string" && logradouro.trim() !== "";
    }).withMessage("Logradouro é obrigatório")
  ],
  proprietarioController.criarEndereco.bind(proprietarioController)
);

// Remover endereço de um proprietário
router.delete(
  "/:id/endereco",
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

router.put(
  "/:id/identificacao",
  exigeLogin(),
  [
    body("nome")
      .optional()
      .isString().withMessage("Nome deve ser uma string"),
    body("razaoSocial")
      .optional()
      .isString().withMessage("Razão Social deve ser uma string"),
  ],
  proprietarioController.atualizarNomeOuRazaoSocial.bind(proprietarioController)
);

router.put(
  "/:id/inscricao-estadual",
  exigeLogin(),
  [
    body("inscricaoEstadual")
      .custom((value) => {
        if (!value || typeof value !== "string" || value.trim() === "") {
          throw new Error("A Inscrição Estadual deve ser informada");
        }

        return true;
      })
  ],
  proprietarioController.atualizarInscricaoEstadual.bind(proprietarioController)
);

router.get(
  "/:id/",
  exigeLogin(),
  proprietarioController.getProprietarioEEndereco.bind(proprietarioController)
);

router.delete(
  "/:id/",
  exigeLogin(),
  proprietarioController.deletarProprietario.bind(proprietarioController)
);

export default router;