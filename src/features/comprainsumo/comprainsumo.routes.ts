import { Router } from 'express';
import { body, param, query } from 'express-validator';
import exigeLogin from "../../shared/middlewares/exigeLogin"; 
import CompraInsumoController from './comprainsumo.controller';
import CompraInsumoService from './comprainsumo.service';

import CompraInsumoRepository from './comprainsumo.repository';
import DespesaRepository from '../despesa/despesa.repository';
import PropriedadeRepository from '../propriedade/propriedade.repository';
import PessoaRepository from '../../shared/domain/pessoa/pessoa.repository';
import FornecedorRepository from '../../shared/domain/pessoa/fornecedor/fornecedor.repository';
import InsumoRepository from '../../shared/domain/insumo/insumo.repository';
import TransacaoFinanceiraRepository from '../../shared/domain/transacaofinanceira/transacaofinanceira.repository';
import { prisma } from "../../shared/config/database"; 
import { FormaPagamento, TipoOperacao } from '../../shared/domain/transacaofinanceira/transacaofinanceira.entity';
import EstoqueInsumoRepository from '../../shared/domain/estoqueinsumo/estoqueinsumo.repository';
import InsumoService from '../insumo/insumo.service';
import DespesaService from '../despesa/despesa.service';

const router = Router();

const transacaoRepo = new TransacaoFinanceiraRepository(prisma);
const pessoaRepo = new PessoaRepository(prisma);
const fornecedorRepo = new FornecedorRepository(prisma, pessoaRepo);
const despesaRepo = new DespesaRepository(prisma, transacaoRepo, pessoaRepo);
const compraRepo = new CompraInsumoRepository(prisma, despesaRepo);
const propriedadeRepo = new PropriedadeRepository(prisma);
const insumoRepo = new InsumoRepository(prisma);
const estoqueRepo = new EstoqueInsumoRepository();

const insumoService = new InsumoService(prisma, insumoRepo, estoqueRepo);
const despesaService = new DespesaService(prisma, despesaRepo, propriedadeRepo, pessoaRepo);

const compraInsumoService = new CompraInsumoService(
  prisma, 
  insumoService,
  despesaService,
  compraRepo, 
  propriedadeRepo, 
  fornecedorRepo, 
  insumoRepo,
  estoqueRepo
);

const compraInsumoController = new CompraInsumoController(compraInsumoService);


router.post(
  '/',
  exigeLogin(),
  [
    body().custom((value) => {
      if (!value.idInsumo && !value.novoInsumo) {
        throw new Error('É necessário informar o idInsumo ou os dados do novoInsumo.');
      }
      if (value.idInsumo && value.novoInsumo) {
        throw new Error('Informe apenas o idInsumo ou o novoInsumo, não ambos.');
      }
      return true;
    }),

    // Validação Insumo Existente
    body('idInsumo')
      .optional({ nullable: true })
      .isInt({ gt: 0 })
      .withMessage('ID do insumo inválido.'),

    // Validação Novo Insumo
    body('novoInsumo')
      .optional()
      .isObject()
      .withMessage('novoInsumo deve ser um objeto contendo descricao e medida.'),
    body('novoInsumo.descricao')
      .if(body('novoInsumo').exists())
      .notEmpty()
      .withMessage('A descrição do novo insumo é obrigatória.')
      .isLength({ min: 2 }),
    body('novoInsumo.medida')
      .if(body('novoInsumo').exists())
      .notEmpty()
      .withMessage('A unidade de medida do novo insumo é obrigatória.'),

    body('qtdComprada').isFloat({ gt: 0 }).withMessage('A quantidade comprada deve ser maior que zero.'),
    body('idPropriedade').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    body('idEvento').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('O ID do evento deve ser numérico, se fornecido.'),
    body('beneficiado').isInt({ gt: 0 }).withMessage('ID do fornecedor (beneficiado) inválido.'),
    body('valor').isFloat({ gt: 0 }).withMessage('O valor da despesa deve ser maior que zero.'),
    body('descricao').notEmpty().withMessage('A descrição da compra é obrigatória.').isLength({ min: 3 }),
    body('formaPagamento').isIn(Object.values(FormaPagamento)).withMessage('Forma de pagamento inválida.'),
    body('tipoOperacao').isIn(Object.values(TipoOperacao)).withMessage('Tipo de operação inválido.')
  ],
  compraInsumoController.cadastrar.bind(compraInsumoController)
);

router.get(
  '/buscar',
  exigeLogin(),
  [
    query('descricao').notEmpty().withMessage('O termo de busca descrição é obrigatório.')
  ],
  compraInsumoController.listarPorInsumoDescricao.bind(compraInsumoController)
);

router.get(
  '/propriedades/:idPropriedade',
  exigeLogin(),
  [
    param('idPropriedade').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.')
  ],
  compraInsumoController.listarPorPropriedade.bind(compraInsumoController)
);

router.get(
  '/',
  exigeLogin(),
  compraInsumoController.listarPorProprietario.bind(compraInsumoController)
);

router.get(
  '/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da compra inválido.')
  ],
  compraInsumoController.buscarPorId.bind(compraInsumoController)
);

export default router;