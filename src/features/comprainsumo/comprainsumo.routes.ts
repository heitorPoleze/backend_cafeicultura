import { Router } from 'express';
import { body, param } from 'express-validator';
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

const router = Router();

const transacaoRepo = new TransacaoFinanceiraRepository(prisma);
const pessoaRepo = new PessoaRepository(prisma);
const fornecedorRepo = new FornecedorRepository(prisma, pessoaRepo);
const despesaRepo = new DespesaRepository(prisma, transacaoRepo, pessoaRepo);
const compraRepo = new CompraInsumoRepository(prisma, despesaRepo);
const propriedadeRepo = new PropriedadeRepository(prisma);
const insumoRepo = new InsumoRepository(prisma);

const compraInsumoService = new CompraInsumoService(
  prisma, 
  compraRepo, 
  despesaRepo, 
  propriedadeRepo, 
  fornecedorRepo, 
  insumoRepo
);

const compraInsumoController = new CompraInsumoController(compraInsumoService);


router.post(
  '/',
  exigeLogin(),
  [
    body('idInsumo').isInt({ gt: 0 }).withMessage('ID do insumo inválido.'),
    body('qtdComprada').isFloat({ gt: 0 }).withMessage('A quantidade comprada deve ser maior que zero.'),
    body('idPropriedade').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    body('idEvento').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('O ID do evento deve ser numérico, se fornecido.'),
    body('beneficiado').isInt({ gt: 0 }).withMessage('ID do fornecedor (beneficiado) inválido.'),
    body('valor').isFloat({ gt: 0 }).withMessage('O valor da despesa deve ser maior que zero.'),
    body('descricao').notEmpty().withMessage('A descrição da compra é obrigatória.').isLength({ min: 3 }),
    body('formaPagamento').isIn(Object.values(FormaPagamento)).withMessage('Forma de pagamento inválida.'),
    body('tipoOperacao').isIn(Object.values(TipoOperacao)).withMessage('Tipo de operação inválido. Deve ser DESPESA.')
  ],
  compraInsumoController.cadastrar.bind(compraInsumoController)
);


router.get(
  '/buscar/:descricao',
  exigeLogin(),
  [
    param('descricao').notEmpty().withMessage('O termo de busca (descrição) é obrigatório.')
  ],
  compraInsumoController.listarPorInsumoDescricao.bind(compraInsumoController)
);

router.get(
  '/propriedade/:idPropriedade',
  exigeLogin(),
  [
    param('idPropriedade').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.')
  ],
  compraInsumoController.listarPorPropriedade.bind(compraInsumoController)
);

router.get(
  '/proprietario',
  exigeLogin(),
  [],
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