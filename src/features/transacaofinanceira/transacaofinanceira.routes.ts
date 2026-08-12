import { Router } from 'express';
import { param, query } from 'express-validator';
import { prisma } from "../../shared/config/database";
import exigeLogin from "../../shared/middlewares/exigeLogin"; 
import TransacaoFinanceiraController from './transacaofinanceira.controller';
import PropriedadeRepository from '../propriedade/propriedade.repository';
import DespesaRepository from '../despesa/despesa.repository';
import TransacaoFinanceiraRepository from '../../shared/domain/transacaofinanceira/transacaofinanceira.repository';
import PessoaRepository from '../../shared/domain/pessoa/pessoa.repository';
import TransacaoFinanceiraService from './transacaofinanceira.service';

const router = Router();
const propriedadeRepo = new PropriedadeRepository(prisma);
const transacaoRepo = new TransacaoFinanceiraRepository(prisma);
const pessoaRepo = new PessoaRepository(prisma);
const despesaRepo = new DespesaRepository(prisma, transacaoRepo, pessoaRepo);
const transacaoService = new TransacaoFinanceiraService(prisma, propriedadeRepo, despesaRepo);
const transacaoFinanceiraController = new TransacaoFinanceiraController(transacaoService);

router.get(
  '/propriedade/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    query('dataInicio').optional().isISO8601().withMessage('Formato de dataInicio inválido.'),
    query('dataFim').optional().isISO8601().withMessage('Formato de dataFim inválido.'),
    query('pagina').optional().isInt({ gt: 0 }).withMessage('A página deve ser maior que zero.'),
    query('limite').optional().isInt({ gt: 0 }).withMessage('O limite deve ser maior que zero.')
  ],
  transacaoFinanceiraController.gerarExtrato.bind(transacaoFinanceiraController)
);

export default router;