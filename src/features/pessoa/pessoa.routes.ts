import { Router } from "express";
import { body, param } from "express-validator";
import { cpf as validarCPF, cnpj as validarCNPJ } from "cpf-cnpj-validator";
import exigeLogin from "../../shared/middlewares/exigeLogin";
import { prisma } from "../../shared/config/database";

import ClienteRepo from "../../shared/domain/pessoa/cliente/cliente.repository";
import FornecedorRepo from "../../shared/domain/pessoa/fornecedor/fornecedor.repository";
import FuncionarioRepo from "../../shared/domain/pessoa/funcionario/funcionario.repository";
import DiaristaRepo from "../../shared/domain/pessoa/diarista/diarista.repository";
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
const diaristaRepo = new DiaristaRepo(prisma, pessoaRepo);
const meeiroRepo = new MeeiroRepo(prisma, pessoaRepo);
const prestadorRepo = new PrestadorRepo(prisma, pessoaRepo);

const pessoaService = new PessoaService(
  clienteRepo,
  fornecedorRepo,
  funcionarioRepo,
  meeiroRepo,
  prestadorRepo,
  pessoaRepo,
  diaristaRepo,
);

const pessoaController = new PessoaController(pessoaService);

const validarCampoIdentificacao = (
  campo: "nome" | "razaoSocial",
  label: string,
) =>
  body(campo)
    .optional({ checkFalsy: true })
    .isString()
    .withMessage(`${label} deve ser um texto válido.`)
    .bail()
    .trim()
    .isLength({ min: 4, max: 100 })
    .withMessage(`${label} deve conter entre 4 e 100 caracteres.`)
    .bail()
    .matches(/^[\p{L}\s]+$/u)
    .withMessage(
      `${label} deve conter apenas letras (com ou sem acentuação), sem números ou símbolos.`,
    )
    .bail()
    .custom((value: string) => {
      const totalLetras = (value.match(/\p{L}/gu) || []).length;
      if (totalLetras < 4) {
        throw new Error(`${label} deve conter pelo menos 4 letras válidas.`);
      }
      return true;
    });

const validarCriacaoPessoaMista = [
  body("tipoPessoa")
    .isIn(["fisica", "juridica"])
    .withMessage("O tipoPessoa deve ser 'fisica' ou 'juridica'"),

  body("nome")
    .if(body("tipoPessoa").equals("fisica"))
    .trim()
    .notEmpty()
    .withMessage("O nome é obrigatório para Pessoa Física")
    .bail(),
  validarCampoIdentificacao("nome", "O nome"),

  body("cpf")
    .if(body("tipoPessoa").equals("fisica"))
    .optional({ checkFalsy: true })
    .custom((value) => validarCPF.isValid(value, true))
    .withMessage("O CPF informado é inválido"),

  body("razaoSocial")
    .if(body("tipoPessoa").equals("juridica"))
    .trim()
    .notEmpty()
    .withMessage("A Razão Social é obrigatória para Pessoa Jurídica")
    .bail(),
  validarCampoIdentificacao("razaoSocial", "A Razão Social"),

  body("cnpj")
    .if(body("tipoPessoa").equals("juridica"))
    .optional({ checkFalsy: true })
    .custom((value) => validarCNPJ.isValid(value, true))
    .withMessage("O CNPJ informado é inválido"),

  body("inscrEstadual")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("A Inscrição Estadual deve ser um texto"),
];

const validarCriacaoPessoaFisica = [
  body("tipoPessoa")
    .equals("fisica")
    .withMessage("Este cadastro aceita apenas Pessoa Física ('fisica')"),
  body("nome").trim().notEmpty().withMessage("O nome é obrigatório").bail(),
  validarCampoIdentificacao("nome", "O nome"),
  body("cpf")
    .optional({ checkFalsy: true })
    .custom((value) => validarCPF.isValid(value, true))
    .withMessage("O CPF informado é inválido"),
];

const validarCriacaoFuncionario = [
  ...validarCriacaoPessoaFisica,
  body("ctps")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("A CTPS deve ser um texto válido"),
  body("salario")
    .optional({ checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage("O salário deve ser um valor numérico maior que zero"),
];

const validarCriacaoDiarista = [
  ...validarCriacaoPessoaFisica,
  body("valorHora")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("O valorHora deve ser um valor numérico maior ou igual a zero"),
];

const validarAtualizacaoPessoa = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("O ID deve ser um número inteiro válido."),
  body().custom((_, { req }) => {
    const temNome = Boolean(req.body?.nome && String(req.body.nome).trim());
    const temRazaoSocial = Boolean(
      req.body?.razaoSocial && String(req.body.razaoSocial).trim(),
    );

    if (!temNome && !temRazaoSocial) {
      throw new Error(
        "Informe o 'nome' ou a 'razaoSocial' para atualizar o cadastro.",
      );
    }
    if (temNome && temRazaoSocial) {
      throw new Error(
        "Informe apenas 'nome' ou 'razaoSocial', nunca os dois ao mesmo tempo.",
      );
    }
    return true;
  }),
  validarCampoIdentificacao("nome", "O nome"),
  validarCampoIdentificacao("razaoSocial", "A Razão Social"),
];

const validarEndereco = [
  param("id").isInt().withMessage("O ID deve ser um número inteiro"),
  body("cidade").isString().notEmpty().withMessage("A cidade é obrigatória"),
  body("cep")
    .isString()
    .matches(/^\d{5}-\d{3}$/)
    .withMessage("CEP inválido. Formato esperado: XXXXX-XXX"),
  body("uf")
    .isString()
    .isLength({ min: 2, max: 2 })
    .withMessage("UF deve ter exatos 2 caracteres"),
  body("logradouro")
    .isString()
    .notEmpty()
    .withMessage("O logradouro é obrigatório"),
];

router.get(
  "/funcionarios",
  exigeLogin(),
  pessoaController.buscarFuncionarioPorIdAdministrador.bind(pessoaController),
);
router.get(
  "/diaristas",
  exigeLogin(),
  pessoaController.buscarDiaristasPorIdAdministrador.bind(pessoaController)
);
router.get(
  "/meeiros",
  exigeLogin(),
  pessoaController.buscarMeeirosPorIdAdministrador.bind(pessoaController),
);
router.get(
  "/prestadores",
  exigeLogin(),
  pessoaController.buscarPrestadoresDeServicoPorIdAdministrador.bind(
    pessoaController,
  ),
);
router.get(
  "/fornecedores",
  exigeLogin(),
  pessoaController.buscarFornecedoresPorIdAdministrador.bind(pessoaController),
);
router.get(
  "/clientes",
  exigeLogin(),
  pessoaController.buscarClientesPorIdAdministrador.bind(pessoaController),
);
router.get(
  "/pessoas",
  exigeLogin(),
  pessoaController.listarPessoas.bind(pessoaController),
);

router.post(
  "/pessoa/cadastrar-endereco/:id",
  exigeLogin(),
  validarEndereco,
  pessoaController.cadastrarEnderecoPessoaGenerica.bind(pessoaController),
);

router.put(
  "/pessoa/atualizar-endereco/:id",
  exigeLogin(),
  validarEndereco,
  pessoaController.atualizarEnderecoPessoaGenerica.bind(pessoaController),
);

router.delete(
  "/pessoa/deletar-endereco/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.removerEnderecoPessoaGenerica.bind(pessoaController),
);

router.post(
  "/clientes",
  exigeLogin(),
  validarCriacaoPessoaMista,
  pessoaController.cadastrarCliente.bind(pessoaController),
);
router.get(
  "/clientes/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarClientePorId.bind(pessoaController),
);
router.delete(
  "/clientes/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirCliente.bind(pessoaController),
);

router.post(
  "/fornecedores",
  exigeLogin(),
  validarCriacaoPessoaMista,
  pessoaController.cadastrarFornecedor.bind(pessoaController),
);
router.get(
  "/fornecedores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarFornecedorPorId.bind(pessoaController),
);
router.delete(
  "/fornecedores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirFornecedor.bind(pessoaController),
);

router.post(
  "/funcionarios",
  exigeLogin(),
  validarCriacaoFuncionario,
  pessoaController.cadastrarFuncionario.bind(pessoaController),
);
router.get(
  "/funcionarios/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarFuncionarioPorId.bind(pessoaController),
);
router.put(
  "/funcionarios/:id/salario",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body("salario")
      .isFloat({ gt: 0 })
      .withMessage("O salário deve ser um valor numérico maior que zero"),
  ],
  pessoaController.atualizarFuncionarioSalario.bind(pessoaController),
);
router.delete(
  "/funcionarios/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirFuncionario.bind(pessoaController),
);

router.post(
  "/diaristas",
  exigeLogin(),
  validarCriacaoDiarista,
  pessoaController.cadastrarDiarista.bind(pessoaController)
);
router.get(
  "/diaristas/:id",
  exigeLogin(),
  [param("id").isInt({ gt: 0 }).withMessage("O ID deve ser um número inteiro válido")],
  pessoaController.buscarDiaristaPorId.bind(pessoaController)
);
router.patch(
  "/diaristas/:id/valor-hora",
  exigeLogin(),
  [
    param("id").isInt({ gt: 0 }).withMessage("O ID deve ser um número inteiro válido"),
    body("valorHora")
      .notEmpty()
      .withMessage("O campo valorHora é obrigatório")
      .bail()
      .isFloat({ gt: 0 })
      .withMessage("O valor da hora deve ser um número maior que zero"),
  ],
  pessoaController.atualizarDiaristaValorHora.bind(pessoaController)
);
router.delete(
  "/diaristas/:id",
  exigeLogin(),
  [param("id").isInt({ gt: 0 }).withMessage("O ID deve ser um número inteiro válido")],
  pessoaController.excluirDiarista.bind(pessoaController)
);

router.post(
  "/meeiros",
  exigeLogin(),
  validarCriacaoPessoaFisica,
  pessoaController.cadastrarMeeiro.bind(pessoaController),
);
router.get(
  "/meeiros/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarMeeiroPorId.bind(pessoaController),
);
router.delete(
  "/meeiros/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirMeeiro.bind(pessoaController),
);

router.post(
  "/prestadores",
  exigeLogin(),
  validarCriacaoPessoaMista,
  pessoaController.cadastrarPrestador.bind(pessoaController),
);
router.get(
  "/prestadores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarPrestadorPorId.bind(pessoaController),
);
router.delete(
  "/prestadores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirPrestador.bind(pessoaController),
);

router.patch(
  "/pessoas/identificacao/:id",
  exigeLogin(),
  validarAtualizacaoPessoa,
  pessoaController.atualizarNomeOuRazaoSocial.bind(pessoaController),
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
  pessoaController.atualizarCpf.bind(pessoaController),
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
  pessoaController.atualizarCnpj.bind(pessoaController),
);

router.patch(
  "/pessoa-juridica/atualizar-inscricaoEstadual/:id",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body("inscricaoEstadual")
      .optional({ checkFalsy: true })
      .isString()
      .notEmpty()
      .withMessage("A Inscrição Estadual deve ser informada caso enviada"),
  ],
  pessoaController.atualizarInscricaoEstadual.bind(pessoaController),
);

export default router;
