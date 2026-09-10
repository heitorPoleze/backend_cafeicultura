import { Router } from 'express';
import { body, param } from 'express-validator';
import { prisma } from "../../shared/config/database";
import exigeLogin from "../../shared/middlewares/exigeLogin";
import NotificacaoRepository from './notificacao.repository';
import NotificacaoService from './notificacao.service';
import NotificacaoController from './notificacao.controller';

const router = Router();

const notificacaoRepository = new NotificacaoRepository(prisma);
const notificacaoService = new NotificacaoService(notificacaoRepository);
const notificacaoController = new NotificacaoController(notificacaoService);

router.get(
    '/propriedades/:id',
    exigeLogin(),
    [
      param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.')
    ],
    notificacaoController.listarTodasPropriedade.bind(notificacaoController)
);

router.get(
  '/nao-lidas/propriedades/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.')
  ],
  notificacaoController.listarNaoLidasPropriedade.bind(notificacaoController)
);

router.get(
  '/nao-lidas', 
  exigeLogin(), 
  notificacaoController.listarNaoLidas.bind(notificacaoController)
);

router.get(
  '/', 
  exigeLogin(), 
  notificacaoController.listarTodas.bind(notificacaoController)
);

router.patch(
  '/lida', 
  exigeLogin(), 
  [
    body('idsNotificacoes').isArray().withMessage('IDs de notificação devem ser enviados em formato de lista.'),
    body('idsNotificacoes.*').isInt({ gt: 0 }).withMessage('ID de notificação inválido.'),
  ],
  notificacaoController.marcarComoLida.bind(notificacaoController)
);

export default router;