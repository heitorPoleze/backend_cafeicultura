import { Router } from 'express';
import { body, param, query } from 'express-validator';
import exigeLogin from "../../shared/middlewares/exigeLogin"; 
import InsumoController from './insumo.controller';
import InsumoService from './insumo.service';
import InsumoRepository from '../../shared/domain/insumo/insumo.repository';
import { prisma } from "../../shared/config/database"; 
import { MedidaInsumo } from '../../shared/domain/insumo/insumo.entity';
import EstoqueInsumoRepository from '../../shared/domain/estoqueinsumo/estoqueinsumo.repository';

const router = Router();

const estoqueRepository = new EstoqueInsumoRepository();
const insumoRepository = new InsumoRepository(prisma);
const insumoService = new InsumoService(prisma, insumoRepository, estoqueRepository);
const insumoController = new InsumoController(insumoService);

router.get(
    '/',
    exigeLogin(),
    [
        query('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade deve ser numérico.')
    ],
    insumoController.listarTodos.bind(insumoController)
);

router.get(
    '/buscar',
    exigeLogin(),
    [
        query('descricao').notEmpty().withMessage('A descrição para busca é obrigatória.'),
        query('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade deve ser numérico.')
    ],
    insumoController.buscarPorDescricao.bind(insumoController)
);

router.get(
    '/:id',
    exigeLogin(),
    [
        param('id').isInt({ gt: 0 }).withMessage('O ID do insumo informado na URL é inválido.'),
        query('idPropriedade').isInt({ gt: 0 }).withMessage('O ID da propriedade deve ser numérico.')
    ],
    insumoController.buscarPorId.bind(insumoController)
);

export default router;