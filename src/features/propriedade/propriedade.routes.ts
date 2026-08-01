import { Router } from "express";
import { body } from "express-validator";

import { prisma } from "../../shared/config/database";
import exigeLogin from "../../shared/middlewares/exigeLogin";

import PropriedadeRepository from "./propriedade.repository";
import PropriedadeService from "./propriedade.service";
import PropriedadeController from "./propriedade.controller";
import TalhaoRepository from "../talhao/talhao.repository";

const router = Router();

const talhaoRepo = new TalhaoRepository(prisma);
const propriedadeRepo = new PropriedadeRepository(prisma);
const propriedadeService = new PropriedadeService(prisma, propriedadeRepo, talhaoRepo);
const propriedadeController = new PropriedadeController(propriedadeService);

router.post(
  "/",
  exigeLogin(),
  [
    // Validação da Propriedade (Raiz)
    body("nome").notEmpty().withMessage("O nome da propriedade é obrigatório"),

    // Validação do Shared Domain: Tamanho
    body("tamanho.valor")
      .isFloat({ gt: 0 })
      .withMessage("O valor do tamanho deve ser um número maior que zero"),
    body("tamanho.medida")
      .isIn(["hectare", "m2"])
      .withMessage("A unidade de medida deve ser 'hectare' ou 'm2'"),

    // Validação do Shared Domain: Endereço
    body("endereco.logradouro").notEmpty().withMessage("O logradouro é obrigatório"),
    body("endereco.bairro").notEmpty().withMessage("O bairro é obrigatório"),
    body("endereco.cidade").notEmpty().withMessage("A cidade é obrigatória"),
    body("endereco.uf")
      .isLength({ min: 2, max: 2 })
      .withMessage("A UF deve conter exatamente 2 letras"),
    body("endereco.pais").notEmpty().withMessage("O país é obrigatório"),
    body("endereco.cep")
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage("O formato do CEP é inválido"),
  ],
  propriedadeController.cadastrar.bind(propriedadeController)
);

router.get(
  "/proprietario",
  exigeLogin(),
  propriedadeController.listarPorProprietario.bind(propriedadeController)
);

router.get(
  "/:id",
  exigeLogin(),
  propriedadeController.buscarPorId.bind(propriedadeController)
);

router.patch(
  "/:id/nome",
  exigeLogin(),
  [
    body("nome")
      .notEmpty()
      .withMessage("O novo nome da propriedade não pode ser vazio"),
  ],
  propriedadeController.atualizarNome.bind(propriedadeController)
);

router.patch(
  "/:id/tamanho",
  exigeLogin(),
  [
    body("tamanho.valor")
      .isFloat({ gt: 0 })
      .withMessage("O valor do tamanho deve ser um número maior que zero"),
    body("tamanho.medida")
      .isIn(["hectare", "m2"])
      .withMessage("A unidade de medida deve ser 'hectare' ou 'm2'"),
  ],
  propriedadeController.atualizarTamanho.bind(propriedadeController)
);

router.patch(
  "/:id/endereco",
  exigeLogin(),
  [
    body("endereco.cidade").notEmpty().withMessage("A cidade é obrigatória"),
    body("endereco.cep")
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage("O formato do CEP é inválido"),
    body("endereco.uf")
      .isLength({ min: 2, max: 2 })
      .withMessage("A UF deve conter exatamente 2 letras"),
    body("endereco.pais").notEmpty().withMessage("O país é obrigatório"),
    body("endereco.bairro").notEmpty().withMessage("O bairro é obrigatório"),
    body("endereco.logradouro").notEmpty().withMessage("O logradouro é obrigatório"),
  ],
  propriedadeController.atualizarEndereco.bind(propriedadeController)
);

export default router;