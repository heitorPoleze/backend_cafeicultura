import { Router } from 'express';
import { body, param, query } from 'express-validator';
import exigeLogin from "../../shared/middlewares/exigeLogin"; 
import TratoCulturalController from './tratocultural.controller';
import TratoCulturalService from './tratocultural.service';

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
import { FormaPagamento, TipoOperacao } from '../../shared/domain/transacaofinanceira/transacaofinanceira.entity';
import { StatusTrato } from './tratocultural.dto';

const router = Router();

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


router.get(
  '/tipos',
  exigeLogin(),
  tratoCulturalController.buscarTiposTratos.bind(tratoCulturalController)
);

router.get(
  '/propriedade/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    query('filtroInicio').optional().isISO8601().withMessage('O formato da dataInicio deve ser ISO8601.'),
    query('filtroFim').optional().isISO8601().withMessage('O formato da dataFim deve ser ISO8601.'),
    query('status')
      .optional()
      .isIn(Object.values(StatusTrato))
      .withMessage(`O status deve ser um dos seguintes: ${Object.values(StatusTrato).join(', ')}.`),
    query('pagina').optional().isInt({ gt: 0 }).withMessage('A página deve ser maior que zero.')
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
    param('idTalhao').isInt({ gt: 0 }).withMessage('O ID do talhão informado na URL é inválido.'),
    query('pagina').isInt({ gt: 0 }).withMessage('A página deve ser maior que zero.'),
  ],
  tratoCulturalController.listarTodosTalhao.bind(tratoCulturalController)
);

router.post(
  '/',
  exigeLogin(),
  [
    body('idTalhao').isInt({ gt: 0 }).withMessage('O ID do talhão é obrigatório e deve ser um número inteiro válido.'),
    body('idSafra').isInt({ gt: 0 }).withMessage('O ID da safra é obrigatório e deve ser um número inteiro válido.'),
    body('idTipoTrato').isInt({ gt: 0 }).withMessage('O ID do tipo de trato é obrigatório e deve ser um número inteiro válido.'),
    body('dataInicio').notEmpty().withMessage('A data de início é obrigatória.').isISO8601().withMessage('A data de início deve estar em formato ISO8601.'),
    body('dataFim').optional({ nullable: true }).isISO8601().withMessage('A data de fim deve estar em formato ISO8601.'),
    body('descricao').optional().isString().withMessage('A descrição deve ser um texto.'),
    
    body('insumosUtilizados').optional().isArray().withMessage('Os insumos utilizados devem ser uma lista (array).'),
    body('insumosUtilizados.*.idInsumo').optional().isInt({ gt: 0 }).withMessage('ID do insumo inválido.'),
    body('insumosUtilizados.*.qtdUsada').optional().isFloat({ gt: 0 }).withMessage('A quantidade deve ser maior que zero.'),
    
    body('responsaveisIds').optional().isArray().withMessage('Os responsáveis devem ser enviados em formato de lista.'),
    body('responsaveisIds.*').optional().isInt({ gt: 0 }).withMessage('ID de responsável inválido.'),

    body('transacoesFinanceiras').optional().isArray().withMessage('As transações devem ser uma lista (array).'),
    body('transacoesFinanceiras.*.idPropriedade').isInt({ gt: 0 }).withMessage('ID da propriedade inválido na transação.'),
    body('transacoesFinanceiras.*.valor').isFloat({ gt: 0 }).withMessage('O valor da transação deve ser maior que zero.'),
    body('transacoesFinanceiras.*.formaPagamento').isIn(Object.values(FormaPagamento)).withMessage('Forma de pagamento inválida.'),
    body('transacoesFinanceiras.*.tipoOperacao').isIn(Object.values(TipoOperacao)).withMessage('Tipo de operação inválido.'),
    body('transacoesFinanceiras.*.beneficiado').isInt({ gt: 0 }).withMessage('ID do beneficiado inválido na transação.'),
    body('transacoesFinanceiras.*.descricao').optional().isString().withMessage('A descrição da transação deve ser um texto.')
  ],
  tratoCulturalController.cadastrar.bind(tratoCulturalController)
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
    body('dataFim').notEmpty().withMessage('A data de fim é obrigatória.').isISO8601().withMessage('A data de fim deve estar em formato ISO8601.')
  ],
  tratoCulturalController.finalizar.bind(tratoCulturalController)
);

router.patch(
  '/:id/responsaveis',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }),
    body('responsaveisIds').isArray().withMessage('Os responsáveis devem ser enviados em formato de lista.'),
    body('responsaveisIds.*').isInt({ gt: 0 }).withMessage('ID de responsável inválido.')
  ],
  tratoCulturalController.editarResponsaveis.bind(tratoCulturalController)
);

router.patch(
  '/:id/insumos',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }),
    body('insumos').isArray().withMessage('Insumos devem ser um array.'),
    body('insumos.*.idInsumo').isInt({ gt: 0 }),
    body('insumos.*.qtdUsada').isFloat({ gt: 0 })
  ],
  tratoCulturalController.inserirInsumos.bind(tratoCulturalController)
);

router.delete(
  '/:id/transacoes',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }),
    body('idTransacoes').isArray().withMessage('idTransacoes deve ser um array.'),
    body('idTransacoes.*').isInt({ gt: 0 })
  ],
  tratoCulturalController.excluirTransacoes.bind(tratoCulturalController)
);

router.delete(
  '/:id/insumos',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }),
    body('idInsumos').isArray().withMessage('idInsumos deve ser um array.'),
    body('idInsumos.*').isInt({ gt: 0 })
  ],
  tratoCulturalController.excluirInsumos.bind(tratoCulturalController)
);

export default router;