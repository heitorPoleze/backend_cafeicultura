import { Router } from 'express';
import { body, param } from 'express-validator';
import exigeLogin from "../../shared/middlewares/exigeLogin"; 
import TratoCulturalController from './tratocultural.controller';
import TratoCulturalService from './tratocultural.service';

// Repositories
import TratoCulturalRepository from './tratocultural.repository';
import PropriedadeRepository from '../propriedade/propriedade.repository';
import SafraRepository from '../safra/safra.repository';
import InsumoRepository from '../../shared/domain/insumo/insumo.repository';
import TalhaoRepository from '../talhao/talhao.repository';
import PessoaRepository from '../../shared/domain/pessoa/pessoa.repository';
import { prisma } from "../../shared/config/database"; 
import EventoRepository from '../../shared/domain/evento/evento.repository';
import EventoAgricolaRepository from '../../shared/domain/evento/eventoagricola/eventoagricola.repository';
import DespesaRepository from '../despesa/despesa.repository';
import TransacaoFinanceiraRepository from '../../shared/domain/transacaofinanceira/transacaofinanceira.repository';

const router = Router();

// --- Instantiations ---
const transacaoRepository = new TransacaoFinanceiraRepository(prisma);
const pessoaRepository = new PessoaRepository(prisma);
const despesaRepository = new DespesaRepository(prisma, transacaoRepository, pessoaRepository);
const eventoRepository = new EventoRepository(prisma, despesaRepository);
const eventoAgricolaRepository = new EventoAgricolaRepository(prisma);
const propriedadeRepository = new PropriedadeRepository(prisma);
const safraRepository = new SafraRepository(prisma);
const insumoRepository = new InsumoRepository(prisma);
const talhaoRepository = new TalhaoRepository(prisma);
const tratoCulturalRepository = new TratoCulturalRepository(prisma, eventoRepository, eventoAgricolaRepository, pessoaRepository, despesaRepository);

const tratoCulturalService = new TratoCulturalService(
  tratoCulturalRepository,
  propriedadeRepository,
  safraRepository,
  insumoRepository,
  talhaoRepository,
  pessoaRepository
);

const tratoCulturalController = new TratoCulturalController(tratoCulturalService);


router.post(
  '/',
  exigeLogin(),
  [
    body('idTalhao').isInt({ gt: 0 }).withMessage('O ID do talhão é obrigatório e deve ser um número inteiro válido.'),
    body('idSafra').isInt({ gt: 0 }).withMessage('O ID da safra é obrigatório e deve ser um número inteiro válido.'),
    body('idTipoTrato').isInt({ gt: 0 }).withMessage('O ID do tipo de trato é obrigatório e deve ser um número inteiro válido.'),
    body('dataInicio').notEmpty().withMessage('A data de início é obrigatória.').isISO8601().withMessage('A data de início deve estar em um formato válido (ex: YYYY-MM-DD).'),
    body('dataFim').optional({ nullable: true }).isISO8601().withMessage('A data de fim deve estar em um formato válido (ex: YYYY-MM-DD).'),
    body('descricao').optional().isString().withMessage('A descrição deve ser um texto.'),
    body('insumosUtilizados').optional().isArray().withMessage('Os insumos utilizados devem ser enviados em formato de lista (array).'),
    body('insumosUtilizados.*.idInsumo').optional().isInt({ gt: 0 }).withMessage('O ID do insumo deve ser um número inteiro válido.'),
    body('insumosUtilizados.*.qtdUsada').optional().isFloat({ gt: 0 }).withMessage('A quantidade usada do insumo deve ser um número maior que zero.'),
    body('responsaveisIds').optional().isArray().withMessage('Os responsáveis devem ser enviados em formato de lista.'),
    body('responsaveisIds.*').optional().isInt({ gt: 0 }).withMessage('Todos os IDs dos responsáveis devem ser números inteiros válidos.')
  ],
  tratoCulturalController.cadastrar.bind(tratoCulturalController)
);

router.get(
  '/tipos',
  exigeLogin(),
  tratoCulturalController.buscarTiposTratos.bind(tratoCulturalController)
);

router.get(
  '/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID do trato cultural informado na URL é inválido.')
  ],
  tratoCulturalController.buscarPorId.bind(tratoCulturalController)
);

router.patch(
  '/:id/descricao',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID do trato cultural informado na URL é inválido.'),
    body('descricao').notEmpty().withMessage('A descrição é obrigatória.')
  ],
  tratoCulturalController.atualizarDescricao.bind(tratoCulturalController)
)

router.patch(
  '/:id/finalizar',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID do trato cultural informado na URL é inválido.'),
    body('dataFim').notEmpty().withMessage('A data de fim é obrigatória.').isISO8601().withMessage('A data de fim deve estar em um formato válido (ex: YYYY-MM-DD).')
  ],
  tratoCulturalController.finalizar.bind(tratoCulturalController)
);

router.patch(
  '/:id/confirmar',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID do trato cultural informado na URL é inválido.')
  ],
  tratoCulturalController.confirmar.bind(tratoCulturalController)
);
router.get(
  '/propriedade/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID da propriedade informado na URL é inválido.')
  ],
  tratoCulturalController.listarTodosPropriedade.bind(tratoCulturalController)
);

router.get(
  '/propriedade/:id/safra/:idSafra',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID da propriedade informado na URL é inválido.'),
    param('idSafra').isInt({ gt: 0 }).withMessage('O ID da safra informado na URL é inválido.')
  ],
  tratoCulturalController.listarTodosSafra.bind(tratoCulturalController)
);

router.get(
  '/propriedade/:id/talhao/:idTalhao',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('O ID da propriedade informado na URL é inválido.'),
    param('idTalhao').isInt({ gt: 0 }).withMessage('O ID do talhão informado na URL é inválido.')
  ],
  tratoCulturalController.listarTodosTalhao.bind(tratoCulturalController)
);

export default router;