import { Router } from 'express';
import { body, param } from 'express-validator';
import SafraController from './safra.controller';
import SafraService from './safra.service';
import SafraRepository from './safra.repository';
import PropriedadeRepo from '../propriedade/propriedade.repository';
import exigeLogin from '../../shared/middlewares/exigeLogin';
import { prisma } from "../../shared/config/database";

const router = Router();

const safraRepository = new SafraRepository(prisma);
const propriedadeRepo = new PropriedadeRepo(prisma);
const safraService = new SafraService(safraRepository, propriedadeRepo);
const safraController = new SafraController(safraService);

router.post(
  '/',
  exigeLogin(),
  [
    body('idPropriedade').isInt().withMessage('O ID da propriedade é obrigatório e deve ser numérico.'),
    body('dataInicio').isISO8601().withMessage('A data de início é obrigatória e deve ser uma data válida.'),
  ],
  safraController.cadastrar.bind(safraController)
);

router.get(
  '/:id',
  exigeLogin(),
  [
    param('id').isInt().withMessage('O ID da safra deve ser um número inteiro.'),
  ],
  safraController.buscarPorId.bind(safraController)
);
router.get(
  '/propriedade/:idPropriedade',
  exigeLogin(),
  [
    param('idPropriedade').isInt().withMessage('O ID da propriedade deve ser um número inteiro.'),
  ],
  safraController.buscarAtivasPorPropriedade.bind(safraController)
);
router.patch(
  '/:id/finalizar',
  exigeLogin(),
  [
    param('id').isInt().withMessage('O ID da safra deve ser um número inteiro.'),
    body('dataFim').isISO8601().withMessage('A data de fim é obrigatória para finalizar a safra.'),
  ],
  safraController.finalizar.bind(safraController)
);

router.delete(
  '/:id',
  exigeLogin(),
  [
    param('id').isInt().withMessage('O ID da safra deve ser um número inteiro.'),
  ],
  safraController.excluir.bind(safraController)
);

export default router;