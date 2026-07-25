import { Router} from 'express';
import { body, param } from 'express-validator';
import exigeLogin from "../../shared/middlewares/exigeLogin";
import TalhaoController from './talhao.controller';
import TalhaoService from './talhao.service';
import TalhaoRepository from './talhao.repository';
import PropriedadeRepository from '../propriedade/propriedade.repository';
import { prisma } from "../../shared/config/database";

const router = Router();

const propriedadeRepository = new PropriedadeRepository(prisma);
const talhaoRepository = new TalhaoRepository(prisma);
const talhaoService = new TalhaoService(talhaoRepository, propriedadeRepository);
const talhaoController = new TalhaoController(talhaoService);

router.post(
  '/',
  exigeLogin(),
  [
    body('nome').notEmpty().withMessage('O nome do talhão é obrigatório e não pode estar vazio.').isString().withMessage('O nome deve ser um texto válido.'),
    body('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade é obrigatório e deve ser um número inteiro válido.'),
    body('qtdPeCafe').isInt({ min: 0 }).withMessage('A quantidade de pés de café é obrigatória e não pode ser negativa.'),
    body("dataInicio").notEmpty().withMessage('A data de início é obrigatória.').isISO8601().withMessage('A data de início deve estar em um formato válido (ex: YYYY-MM-DD).'),
    body('tamanho.valor').isFloat({ gt: 0 }).withMessage('O valor do tamanho deve ser um número maior que zero.'),
    body('tamanho.medida').isIn(['m2', 'hectare']).withMessage('A medida do tamanho deve ser estritamente "m2" ou "hectare".'),
    body('especie').isIn(['conilon', 'arabica']).withMessage('A espécie deve ser estritamente "conilon" ou "arabica".'),
    body('variedadesIds').isArray({ min: 1 }).withMessage('A lista de variedades é obrigatória e deve conter pelo menos um ID.'),
    body('variedadesIds.*').isInt({ gt: 0 }).withMessage('Todos os IDs das variedades devem ser números inteiros válidos.')
  ],
  talhaoController.cadastrar.bind(talhaoController)
);

router.get(
  '/variedades',
  exigeLogin(),
  talhaoController.buscarVariedades.bind(talhaoController)
);

router.patch(
  '/:id/encerrar',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID do talhão informado na URL é inválido.'),
    body('dataFim').notEmpty().withMessage('A data de fim é obrigatória.').isISO8601().withMessage('A data de fim deve estar em um formato válido (ex: YYYY-MM-DD).')
  ],
  talhaoController.encerrar.bind(talhaoController)
);

router.delete(
  '/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID do talhão informado na URL é inválido.')
  ],
  talhaoController.excluir.bind(talhaoController)
);

router.get(
  '/propriedade/ativos/:idPropriedade',
  exigeLogin(),
  [
    param('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade informado na URL é inválido.')
  ],
  talhaoController.ativosPorPropriedade.bind(talhaoController)
);

router.get(
  '/propriedade/todos/:idPropriedade',
  exigeLogin(),
  [
    param('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade informado na URL é inválido.')
  ],
  talhaoController.allTalhoesPorPropriedade.bind(talhaoController)
);
router.get(
  '/propriedade/desativados/:idPropriedade',
  exigeLogin(),
  [
    param('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade informado na URL é inválido.')
  ],
  talhaoController.desativadosPorPropriedade.bind(talhaoController)
);
router.get(
  '/propriedade/finalizados/:idPropriedade',
  exigeLogin(),
  [
    param('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade informado na URL é inválido.')
  ],
  talhaoController.finalizadosPorPropriedade.bind(talhaoController)
);



export default router;