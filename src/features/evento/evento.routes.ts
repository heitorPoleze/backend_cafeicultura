import { Router } from 'express';
import { param, query } from 'express-validator';
import { prisma } from "../../shared/config/database";
import exigeLogin from "../../shared/middlewares/exigeLogin"; 
import { EventoController } from './evento.controller';
import { EventoService } from './evento.service';
import PropriedadeRepository from '../propriedade/propriedade.repository';
import TratoRepository from '../tratocultural/tratocultural.repository';
import EventoRepository from '../../shared/domain/evento/evento.repository';
import { EventoAgricolaRepository } from '../../shared/domain/evento/eventoagricola/eventoagricola.repository';
import DespesaRepository from '../despesa/despesa.repository';
import TransacaoFinanceiraRepository from '../../shared/domain/transacaofinanceira/transacaofinanceira.repository';
import PessoaRepository from '../../shared/domain/pessoa/pessoa.repository';

const router = Router();

const propriedadeRepo = new PropriedadeRepository(prisma);
const pessoaRepo = new PessoaRepository(prisma);
const transacaoRepo = new TransacaoFinanceiraRepository(prisma);
const despesaRepo = new DespesaRepository(prisma, transacaoRepo, pessoaRepo);
const eventoRepo = new EventoRepository(prisma, despesaRepo);
const eventoAgricolaRepo = new EventoAgricolaRepository(prisma);
const tratoRepo = new TratoRepository(prisma, eventoRepo, eventoAgricolaRepo, pessoaRepo, despesaRepo);
const eventoService = new EventoService(prisma, propriedadeRepo, tratoRepo);
const eventoController = new EventoController(eventoService);

router.get(
  '/propriedade/:id',
  exigeLogin(),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID da propriedade inválido.'),
    query('dataInicio').optional().isISO8601().withMessage('Formato de dataInicio inválido. Deve ser yyyy-mm-dd.'),
    query('dataFim').optional().isISO8601().withMessage('Formato de dataFim inválido. Deve ser yyyy-mm-dd.'),
    query('pagina').optional().isInt({ gt: 0 }).withMessage('A página deve ser um número inteiro maior que zero.')
  ],
  eventoController.listarEventosPorPropriedade.bind(eventoController)
);

export default router;