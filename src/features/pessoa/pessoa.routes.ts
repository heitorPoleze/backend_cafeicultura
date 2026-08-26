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
  
  // Condicionais Física
  body("nome").if(body("tipoPessoa").equals("fisica")).notEmpty().withMessage("O nome é obrigatório para Pessoa Física"),
  body("cpf").if(body("tipoPessoa").equals("fisica")).custom((value) => validarCPF.isValid(value, true)).withMessage("O CPF informado é inválido"),
  
  // Condicionais Jurídica
  body("razaoSocial").if(body("tipoPessoa").equals("juridica")).notEmpty().withMessage("A Razão Social é obrigatória para Pessoa Jurídica"),
  body("cnpj").if(body("tipoPessoa").equals("juridica")).custom((value) => validarCNPJ.isValid(value, true)).withMessage("O CNPJ informado é inválido"),
  body("inscrEstadual").optional()
];

// Validação estrita para Funcionario, Meeiro e Prestador (Apenas Física)
const validarCriacaoPessoaFisica = [
  body("tipoPessoa").equals("fisica").withMessage("Este cadastro aceita apenas Pessoa Física ('fisica')"),
  body("nome").notEmpty().withMessage("O nome é obrigatório"),
  body("cpf").custom((value) => validarCPF.isValid(value, true)).withMessage("O CPF informado é inválido")
];

router.get(
  "/funcionarios",
  // Só de estar logado já vai puxar o ID administrador do usuário logado.
  exigeLogin(),
  pessoaController.buscarFuncionarioPorIdAdministrador.bind(pessoaController)
)
router.get(
  "/meeiros",
  // Só de estar logado já vai puxar o ID administrador do usuário logado.
  exigeLogin(),
  pessoaController.buscarMeeirosPorIdAdministrador.bind(pessoaController)
)
router.get(
  "/prestadores",
  // Só de estar logado já vai puxar o ID administrador do usuário logado.
  exigeLogin(),
  pessoaController.buscarPrestadoresDeServicoPorIdAdministrador.bind(pessoaController)
)
router.get(
  "/fornecedores",
  // Só de estar logado já vai puxar o ID administrador do usuário logado.
  exigeLogin(),
  pessoaController.buscarFornecedoresPorIdAdministrador.bind(pessoaController)
)
router.get(
  "/clientes",
  // Só de estar logado já vai puxar o ID administrador do usuário logado.
  exigeLogin(),
  pessoaController.buscarClientesPorIdAdministrador.bind(pessoaController)
)

router.post(
  "/pessoa/cadastrar-endereco/:id",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body(["cidade", "Cidade"]).custom((value, { req }) => {
          const cidade = value ?? req.body.cidade ?? req.body.Cidade;
          return typeof cidade === "string" && cidade.trim() !== "";
        }).withMessage("Cidade é obrigatória"),
        body(["CEP", "cep", "Cep"]).custom((value, { req }) => {
          const cep = value ?? req.body.CEP ?? req.body.cep ?? req.body.Cep;
          return typeof cep === "string" && /^\d{5}-\d{3}$/.test(cep);
        }).withMessage("CEP inválido"),
        body(["UF", "uf", "Uf"]).custom((value, { req }) => {
          const uf = value ?? req.body.UF ?? req.body.uf ?? req.body.Uf;
          return typeof uf === "string" && uf.length === 2;
        }).withMessage("UF deve ter 2 caracteres"),
        body(["logradouro", "Logradouro"]).custom((value, { req }) => {
          const logradouro = value ?? req.body.logradouro ?? req.body.Logradouro;
          return typeof logradouro === "string" && logradouro.trim() !== "";
        }).withMessage("Logradouro é obrigatório")
  ],
  pessoaController.cadastrarEnderecoPessoaGenerica.bind(pessoaController)
)
router.put(
  "/pessoa/atualizar-endereco/:id",
  exigeLogin(),
  [
    param("id").isInt().withMessage("O ID deve ser um número inteiro"),
    body(["cidade", "Cidade"]).custom((value, { req }) => {
          const cidade = value ?? req.body.cidade ?? req.body.Cidade;
          return typeof cidade === "string" && cidade.trim() !== "";
        }).withMessage("Cidade é obrigatória"),
        body(["CEP", "cep", "Cep"]).custom((value, { req }) => {
          const cep = value ?? req.body.CEP ?? req.body.cep ?? req.body.Cep;
          return typeof cep === "string" && /^\d{5}-\d{3}$/.test(cep);
        }).withMessage("CEP inválido"),
        body(["UF", "uf", "Uf"]).custom((value, { req }) => {
          const uf = value ?? req.body.UF ?? req.body.uf ?? req.body.Uf;
          return typeof uf === "string" && uf.length === 2;
        }).withMessage("UF deve ter 2 caracteres"),
        body(["logradouro", "Logradouro"]).custom((value, { req }) => {
          const logradouro = value ?? req.body.logradouro ?? req.body.Logradouro;
          return typeof logradouro === "string" && logradouro.trim() !== "";
        }).withMessage("Logradouro é obrigatório")
  ],
  pessoaController.atualizarEnderecoPessoaGenerica.bind(pessoaController)
)
router.delete(
  "/pessoa/deletar-endereco/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.RemoverEnderecoPessoaGenerica.bind(pessoaController)
)

router.post(
  "/clientes",
  exigeLogin(),
  validarCriacaoPessoaMista,
  pessoaController.cadastrarCliente.bind(pessoaController)
);

router.get(
  "/clientes/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarClientePorId.bind(pessoaController)
);

router.delete(
  "/clientes/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirCliente.bind(pessoaController)
);

router.post(
  "/fornecedores",
  exigeLogin(),
  validarCriacaoPessoaMista,
  pessoaController.cadastrarFornecedor.bind(pessoaController)
);

router.get(
  "/fornecedores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarFornecedorPorId.bind(pessoaController)
);

router.delete(
  "/fornecedores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirFornecedor.bind(pessoaController)
);


router.post(
  "/funcionarios",
  exigeLogin(),
  [
    ...validarCriacaoPessoaFisica
    //body("ctps").notEmpty().withMessage("A CTPS é obrigatória para funcionários"),
    //body("salario").isFloat({ gt: 0 }).withMessage("O salário deve ser um valor numérico maior que zero")
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

router.delete(
  "/funcionarios/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirFuncionario.bind(pessoaController)
);

router.post(
  "/meeiros",
  exigeLogin(),
  validarCriacaoPessoaFisica,
  pessoaController.cadastrarMeeiro.bind(pessoaController)
);

router.get(
  "/meeiros/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarMeeiroPorId.bind(pessoaController)
);

router.delete(
  "/meeiros/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirMeeiro.bind(pessoaController)
);

router.post(
  "/prestadores",
  exigeLogin(),
  validarCriacaoPessoaMista,
  pessoaController.cadastrarPrestador.bind(pessoaController)
);

router.get(
  "/prestadores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.buscarPrestadorPorId.bind(pessoaController)
);

router.delete(
  "/prestadores/:id",
  exigeLogin(),
  [param("id").isInt().withMessage("O ID deve ser um número inteiro")],
  pessoaController.excluirPrestador.bind(pessoaController)
);

router.get(
  "/pessoas",
  exigeLogin(),
  pessoaController.listarPessoas.bind(pessoaController)
);

router.patch(
  "/pessoas/identificacao/:id",
  exigeLogin(),
  pessoaController.AtualizarNomeOuRazaoSocial.bind(pessoaController),
  [
    body("nome")
      .optional()
      .isString().withMessage("Nome deve ser uma string"),
    body("razaoSocial")
      .optional()
      .isString().withMessage("Razão Social deve ser uma string"),
  ],
);

router.patch("/pessoas-fisicas/cpf/:id",
  exigeLogin(),
  [
    body("cpf").custom((value) => validarCPF.isValid(value, true)).withMessage("O CPF informado é inválido"),
  ],
  pessoaController.atualizarCpf.bind(pessoaController)
)


router.patch("/pessoa-juridica/atualizar-cnpj/:id",
  exigeLogin(),
  [
    body("cnpj").custom((value) => validarCNPJ.isValid(value, true)).withMessage("O CNPJ informado é inválido"),
  ],
  pessoaController.atualizarCpnj.bind(pessoaController)
)

router.patch("/pessoa-juridica/atualizar-inscricaoEstadual/:id",
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
)


export default router;