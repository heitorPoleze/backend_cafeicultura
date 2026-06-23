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

const validacaoPessoaMista = [
  body("tipoPessoa").isIn(['fisica', 'juridica']).withMessage("O tipoPessoa deve ser 'fisica' ou 'juridica'"),
  
  // Condicionais Física
  body("nome").if(body("tipoPessoa").equals("fisica")).notEmpty().withMessage("O nome é obrigatório para Pessoa Física"),
  body("cpf").if(body("tipoPessoa").equals("fisica")).custom((value) => validarCPF.isValid(value)).withMessage("O CPF informado é inválido"),
  
  // Condicionais Jurídica
  body("razaoSocial").if(body("tipoPessoa").equals("juridica")).notEmpty().withMessage("A Razão Social é obrigatória para Pessoa Jurídica"),
  body("cnpj").if(body("tipoPessoa").equals("juridica")).custom((value) => validarCNPJ.isValid(value)).withMessage("O CNPJ informado é inválido"),
  body("inscrEstadual").optional()
];

// Validação estrita para Funcionario, Meeiro e Prestador (Apenas Física)
const validacaoPessoaFisicaEstrita = [
  body("tipoPessoa").equals("fisica").withMessage("Este cadastro aceita apenas Pessoa Física ('fisica')"),
  body("nome").notEmpty().withMessage("O nome é obrigatório"),
  body("cpf").custom((value) => validarCPF.isValid(value)).withMessage("O CPF informado é inválido")
];


router.post(
  "/clientes",
  exigeLogin(),
  validacaoPessoaMista,
  pessoaController.cadastrarCliente.bind(pessoaController)
);

router.get(
  "/clientes/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarClientePorId.bind(pessoaController)
);

router.post(
  "/fornecedores",
  exigeLogin(),
  validacaoPessoaMista,
  pessoaController.cadastrarFornecedor.bind(pessoaController)
);

router.get(
  "/fornecedores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarFornecedorPorId.bind(pessoaController)
);

router.post(
  "/funcionarios",
  exigeLogin(),
  [
    ...validacaoPessoaFisicaEstrita,
    body("ctps").notEmpty().withMessage("A CTPS é obrigatória para funcionários"),
    body("salario").isFloat({ gt: 0 }).withMessage("O salário deve ser um valor numérico maior que zero")
  ],
  pessoaController.cadastrarFuncionario.bind(pessoaController)
);

router.get(
  "/funcionarios/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarFuncionarioPorId.bind(pessoaController)
);

router.put(
  "/funcionarios/:id/salario",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body("salario").isFloat({ gt: 0 }).withMessage("O salário deve ser um valor numérico maior que zero")
  ],
  pessoaController.atualizarFuncionarioSalario.bind(pessoaController)
);

router.post(
  "/meeiros",
  exigeLogin(),
  validacaoPessoaFisicaEstrita,
  pessoaController.cadastrarMeeiro.bind(pessoaController)
);

router.get(
  "/meeiros/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarMeeiroPorId.bind(pessoaController)
);

router.post(
  "/prestadores",
  exigeLogin(),
  validacaoPessoaFisicaEstrita,
  pessoaController.cadastrarPrestador.bind(pessoaController)
);

router.get(
  "/prestadores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarPrestadorPorId.bind(pessoaController)
);

export default router;