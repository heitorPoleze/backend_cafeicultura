import { Router } from 'express';
import { body, param } from 'express-validator';
import TransacaoRepository from '../../shared/domain/transacaofinanceira/transacaofinanceira.repository';
import SafraController from './safra.controller';
import SafraService from './safra.service';
import SafraRepository from './safra.repository';
import TratoRepository from '../tratocultural/tratocultural.repository';
import PropriedadeRepo from '../propriedade/propriedade.repository';
import exigeLogin from '../../shared/middlewares/exigeLogin';
import { prisma } from "../../shared/config/database";
import EventoRepository from '../../shared/domain/evento/evento.repository';
import DespesaRepository from '../despesa/despesa.repository';
import PessoaRepository from '../../shared/domain/pessoa/pessoa.repository';
import { EventoAgricolaRepository } from '../../shared/domain/evento/eventoagricola/eventoagricola.repository';
import NotificacaoRepository from '../notificacao/notificacao.repository';

const router = Router();

const notificacaoRepository = new NotificacaoRepository(prisma);
const pessoaRepository = new PessoaRepository(prisma);
const transacaoRepository = new TransacaoRepository(prisma);
const despesaRepository = new DespesaRepository(prisma, transacaoRepository, pessoaRepository);
const safraRepository = new SafraRepository(prisma);
const eventoRepository = new EventoRepository(prisma, despesaRepository);
const eventoAgricolaRepository = new EventoAgricolaRepository(prisma);
const propriedadeRepo = new PropriedadeRepo(prisma);
const tratoRepository = new TratoRepository(prisma, eventoRepository, eventoAgricolaRepository, pessoaRepository, despesaRepository, notificacaoRepository);
const safraService = new SafraService(prisma, safraRepository, propriedadeRepo, tratoRepository, despesaRepository);
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
  '/propriedade/:idPropriedade/safras/todas',
  exigeLogin(),
  [
    param('idPropriedade').isInt().withMessage('O ID da propriedade deve ser um número inteiro.'),
  ],
  safraController.buscarTodasPorPropriedade.bind(safraController)
)
router.get(
  '/propriedade/:id/safra/:idSafra/custo',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    param('idSafra').isInt({ gt: 0 }).withMessage('ID da safra inválido.')
  ],
  safraController.custoAtualSafra.bind(safraController)
);
router.get(
  '/propriedade/:id/safra/:idSafra/relatorio-financeiro',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    param('idSafra').isInt({ gt: 0 }).withMessage('ID da safra inválido.')
  ],
  safraController.relatorioFinanceiro.bind(safraController)
);
router.get(
  '/propriedade/:id/safra/:idSafra/eventos',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    param('idSafra').isInt({ gt: 0 }).withMessage('ID da safra inválido.')
  ],
  safraController.relatorioEventosSafra.bind(safraController)
);

router.get(
  '/propriedade/:id/safra/:idSafra/talhao/:idTalhao/eventos',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    param('idSafra').isInt({ gt: 0 }).withMessage('ID da safra inválido.'),
    param('idTalhao').isInt({ gt: 0 }).withMessage('ID do talhão inválido.')
  ],
  safraController.relatorioEventosTalhao.bind(safraController)
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
router.patch(
  '/:id/reativar',
  exigeLogin(),
  [
    param('id').isInt().withMessage('O ID da safra deve ser um número inteiro.'),
  ],
  safraController.reativarSafra.bind(safraController)
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