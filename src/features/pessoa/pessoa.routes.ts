import { Router } from "express";
import { body, param } from "express-validator";
import { cpf as validarCPF, cnpj as validarCNPJ } from "cpf-cnpj-validator";
import exigeLogin from "../../shared/middlewares/exigeLogin";
import { prisma } from "../../shared/config/database";

import ClienteRepo from "../../shared/domain/pessoa/cliente/cliente.repository";
import FornecedorRepo from "../../shared/domain/pessoa/fornecedor/fornecedor.repository";
import FuncionarioRepo from "../../shared/domain/pessoa/funcionario/funcionario.repository";
import MeeiroRepo from "../../shared/domain/pessoa/meeiro/meeiro.repository";
import PrestadorRepo from "../../shared/domain/pessoa/prestadordeservico/prestador.repository";
import PessoaRepo from "../../shared/domain/pessoa/pessoa.repository";

import PessoaService from "./pessoa.service";
import PessoaController from "./pessoa.controller";

const router = Router();

const pessoaRepo = new PessoaRepo(prisma);
const clienteRepo = new ClienteRepo(prisma, pessoaRepo);
const fornecedorRepo = new FornecedorRepo(prisma, pessoaRepo);
const funcionarioRepo = new FuncionarioRepo(prisma, pessoaRepo);
const meeiroRepo = new MeeiroRepo(prisma, pessoaRepo);
const prestadorRepo = new PrestadorRepo(prisma, pessoaRepo);

const pessoaService = new PessoaService(
  clienteRepo,
  fornecedorRepo,
  funcionarioRepo,
  meeiroRepo,
  prestadorRepo,
  pessoaRepo
);

const pessoaController = new PessoaController(pessoaService);

const validarCriacaoPessoaMista = [
  body("tipoPessoa").isIn(['fisica', 'juridica']).withMessage("O tipoPessoa deve ser 'fisica' ou 'juridica'"),

  body("nome").if(body("tipoPessoa").equals("fisica")).notEmpty().withMessage("O nome é obrigatório para Pessoa Física"),
  body("cpf")
    .if(body("tipoPessoa").equals("fisica"))
    .optional({ checkFalsy: true })
    .custom((value) => validarCPF.isValid(value, true))
    .withMessage("O CPF informado é inválido"),

  body("razaoSocial").if(body("tipoPessoa").equals("juridica")).notEmpty().withMessage("A Razão Social é obrigatória para Pessoa Jurídica"),
  body("cnpj")
    .if(body("tipoPessoa").equals("juridica"))
    .optional({ checkFalsy: true })
    .custom((value) => validarCNPJ.isValid(value, true))
    .withMessage("O CNPJ informado é inválido"),

  body("inscrEstadual").optional({ checkFalsy: true }).isString().withMessage("A Inscrição Estadual deve ser um texto")
];

const validarCriacaoPessoaFisica = [
  body("tipoPessoa").equals("fisica").withMessage("Este cadastro aceita apenas Pessoa Física ('fisica')"),
  body("nome").notEmpty().withMessage("O nome é obrigatório"),
  body("cpf")
    .optional({ checkFalsy: true })
    .custom((value) => validarCPF.isValid(value, true))
    .withMessage("O CPF informado é inválido")
];

const validarCriacaoFuncionario = [
  ...validarCriacaoPessoaFisica,
  body("ctps")
    .optional({ checkFalsy: true })
    .isString().withMessage("A CTPS deve ser um texto válido"),
  body("salario")
    .optional({ checkFalsy: true })
    .isFloat({ gt: 0 }).withMessage("O salário deve ser um valor numérico maior que zero")
];

const validarEndereco = [
  param("id").isInt().withMessage("O ID deve ser um número inteiro"),
  body("cidade").isString().notEmpty().withMessage("A cidade é obrigatória"),
  body("cep").isString().matches(/^\d{5}-\d{3}$/).withMessage("CEP inválido. Formato esperado: XXXXX-XXX"),
  body("uf").isString().isLength({ min: 2, max: 2 }).withMessage("UF deve ter exatos 2 caracteres"),
  body("logradouro").isString().notEmpty().withMessage("O logradouro é obrigatório")
];

router.get("/funcionarios", exigeLogin(), pessoaController.buscarFuncionarioPorIdAdministrador.bind(pessoaController));
router.get("/meeiros", exigeLogin(), pessoaController.buscarMeeirosPorIdAdministrador.bind(pessoaController));
router.get("/prestadores", exigeLogin(), pessoaController.buscarPrestadoresDeServicoPorIdAdministrador.bind(pessoaController));
router.get("/fornecedores", exigeLogin(), pessoaController.buscarFornecedoresPorIdAdministrador.bind(pessoaController));
router.get("/clientes", exigeLogin(), pessoaController.buscarClientesPorIdAdministrador.bind(pessoaController));
router.get("/pessoas", exigeLogin(), pessoaController.listarPessoas.bind(pessoaController));

router.post(
  "/pessoa/cadastrar-endereco/:id",
  exigeLogin(),
  validarEndereco,
  pessoaController.cadastrarEnderecoPessoaGenerica.bind(pessoaController)
);

router.put(
  "/pessoa/atualizar-endereco/:id",
  exigeLogin(),
  validarEndereco,
  pessoaController.atualizarEnderecoPessoaGenerica.bind(pessoaController)
);

router.delete(
  "/pessoa/deletar-endereco/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.RemoverEnderecoPessoaGenerica.bind(pessoaController)
);

router.post("/clientes", exigeLogin(), validarCriacaoPessoaMista, pessoaController.cadastrarCliente.bind(pessoaController));
router.get("/clientes/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.buscarClientePorId.bind(pessoaController));
router.delete("/clientes/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.excluirCliente.bind(pessoaController));

router.post("/fornecedores", exigeLogin(), validarCriacaoPessoaMista, pessoaController.cadastrarFornecedor.bind(pessoaController));
router.get("/fornecedores/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.buscarFornecedorPorId.bind(pessoaController));
router.delete("/fornecedores/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.excluirFornecedor.bind(pessoaController));

router.post("/funcionarios", exigeLogin(), validarCriacaoFuncionario, pessoaController.cadastrarFuncionario.bind(pessoaController));
router.get("/funcionarios/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.buscarFuncionarioPorId.bind(pessoaController));
router.put(
  "/funcionarios/:id/salario",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body("salario").isFloat({ gt: 0 }).withMessage("O salário deve ser um valor numérico maior que zero")
  ],
  pessoaController.atualizarFuncionarioSalario.bind(pessoaController)
);
router.delete("/funcionarios/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.excluirFuncionario.bind(pessoaController));

router.post("/meeiros", exigeLogin(), validarCriacaoPessoaFisica, pessoaController.cadastrarMeeiro.bind(pessoaController));
router.get("/meeiros/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.buscarMeeiroPorId.bind(pessoaController));
router.delete("/meeiros/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.excluirMeeiro.bind(pessoaController));

router.post("/prestadores", exigeLogin(), validarCriacaoPessoaMista, pessoaController.cadastrarPrestador.bind(pessoaController));
router.get("/prestadores/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.buscarPrestadorPorId.bind(pessoaController));
router.delete("/prestadores/:id", exigeLogin(), [param("id").isInt().withMessage("O ID deve ser um número inteiro")], pessoaController.excluirPrestador.bind(pessoaController));

router.patch(
  "/pessoas/identificacao/:id",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body("nome").optional({ checkFalsy: true }).isString().withMessage("Nome deve ser uma string"),
    body("razaoSocial").optional({ checkFalsy: true }).isString().withMessage("Razão Social deve ser uma string"),
  ],
  pessoaController.AtualizarNomeOuRazaoSocial.bind(pessoaController)
);

router.patch(
  "/pessoas-fisicas/cpf/:id",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body("cpf")
      .optional({ checkFalsy: true })
      .custom((value) => validarCPF.isValid(value, true))
      .withMessage("O CPF informado é inválido"),
  ],
  pessoaController.atualizarCpf.bind(pessoaController)
);

router.patch(
  "/pessoa-juridica/atualizar-cnpj/:id",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body("cnpj")
      .optional({ checkFalsy: true })
      .custom((value) => validarCNPJ.isValid(value, true))
      .withMessage("O CNPJ informado é inválido"),
  ],
  pessoaController.atualizarCnpj.bind(pessoaController)
);

router.patch(
  "/pessoa-juridica/atualizar-inscricaoEstadual/:id",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body("inscricaoEstadual")
      .optional({ checkFalsy: true })
      .isString().notEmpty()
      .withMessage("A Inscrição Estadual deve ser informada caso enviada")
  ],
  pessoaController.atualizarInscricaoEstadual.bind(pessoaController)
);

export default router;