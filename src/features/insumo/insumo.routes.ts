import { Router } from 'express';
import { body, param } from 'express-validator';
import exigeLogin from "../../shared/middlewares/exigeLogin"; 
import InsumoController from './insumo.controller';
import InsumoService from './insumo.service';
import InsumoRepository from '../../shared/domain/insumo/insumo.repository';
import { prisma } from "../../shared/config/database"; 
import { MedidaInsumo } from '../../shared/domain/insumo/insumo.entity';

const router = Router();

const insumoRepository = new InsumoRepository(prisma);
const insumoService = new InsumoService(insumoRepository);
const insumoController = new InsumoController(insumoService);

router.post(
    '/',
    exigeLogin(),
    [
        body('idProprietario').isInt({ gt: 0 }).withMessage('O ID do proprietário é inválido.'),
        body('descricao').notEmpty().withMessage('A descrição é obrigatória.').isString().isLength({ min: 3 }).withMessage('A descrição deve ter no mínimo 3 caracteres.'),
        body('medida').isIn(Object.values(MedidaInsumo)).withMessage('Unidade de medida inválida.')
    ],
    insumoController.cadastrar.bind(insumoController)
);

router.get(
    '/buscar/:descricao',
    exigeLogin(),
    [
        param('descricao').notEmpty().withMessage('A descrição para busca é obrigatória.')
    ],
    insumoController.buscarPorDescricao.bind(insumoController)
);

router.get(
    '/',
    exigeLogin(),
    insumoController.listarTodos.bind(insumoController)
);

router.get(
    '/:id',
    exigeLogin(),
    [
        param('id').isInt({ gt: 0 }).withMessage('O ID do insumo informado na URL é inválido.')
    ],
    insumoController.buscarPorId.bind(insumoController)
);

export default router;