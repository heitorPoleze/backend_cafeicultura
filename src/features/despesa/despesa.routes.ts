import { Router } from 'express';
import { body, param } from 'express-validator';
import exigeLogin from "../../shared/middlewares/exigeLogin"; 
import DespesaController from './despesa.controller';
import DespesaService from './despesa.service';

import DespesaRepository from './despesa.repository';
import PropriedadeRepository from '../propriedade/propriedade.repository';
import PessoaRepository from '../../shared/domain/pessoa/pessoa.repository';
import TransacaoFinanceiraRepository from '../../shared/domain/transacaofinanceira/transacaofinanceira.repository';
import { prisma } from "../../shared/config/database"; 
import { FormaPagamento, TipoOperacao } from '../../shared/domain/transacaofinanceira/transacaofinanceira.entity';

const router = Router();

const transacaoRepo = new TransacaoFinanceiraRepository(prisma);
const pessoaRepo = new PessoaRepository(prisma);
const propriedadeRepo = new PropriedadeRepository(prisma);
const despesaRepo = new DespesaRepository(prisma, transacaoRepo, pessoaRepo);

const despesaService = new DespesaService(despesaRepo, propriedadeRepo, pessoaRepo);
const despesaController = new DespesaController(despesaService);


router.post(
  '/',
  exigeLogin(),
  [
    body('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade é obrigatório e deve ser um número inteiro.'),
    body('idEvento').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('O ID do evento deve ser numérico, se fornecido.'),
    body('beneficiado').isInt({ gt: 0 }).withMessage('O ID do beneficiado (Pessoa) é obrigatório e deve ser um número inteiro.'),
    body('valor').isFloat({ gt: 0 }).withMessage('O valor da despesa deve ser maior que zero.'),
    body('descricao').optional().isString().withMessage('A descrição deve ser um texto.'),
    body('formaPagamento').isIn(Object.values(FormaPagamento)).withMessage('Forma de pagamento inválida.'),
    body('tipoOperacao').isIn(Object.values(TipoOperacao)).withMessage('Tipo de operação inválido.')
  ],
  despesaController.cadastrar.bind(despesaController)
);

router.get(
  '/propriedade/:idPropriedade',
  exigeLogin(),
  [
    param('idPropriedade').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.')
  ],
  despesaController.listarPorPropriedade.bind(despesaController)
);

router.get(
  '/proprietario',
  exigeLogin(),
  [],
  despesaController.listarPorProprietario.bind(despesaController)
);

router.get(
  '/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da despesa inválido.')
  ],
  despesaController.buscarPorId.bind(despesaController)
);

router.delete(
  '/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da despesa inválido.')
  ],
  despesaController.excluir.bind(despesaController)
);

export default router;