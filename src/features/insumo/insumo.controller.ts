import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import InsumoService from './insumo.service';
import { BuscarInsumoPorDescricaoDTO, BuscarInsumoPorIdDTO, BuscarTodosInsumosDTO, CadastrarInsumoDTO } from './insumo.dto';

export class InsumoController {
    constructor(private readonly insumoService: InsumoService) {}

    public async buscarPorId(req: Request, res: Response) {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({ erros: erros.array() });
        };

        try {
            const dto: BuscarInsumoPorIdDTO = {
                id: Number(req.params.id),
                idPropriedade: Number(req.query.idPropriedade)
            };
            const insumo = await this.insumoService.buscarPorId(dto, req.session.idUsuario!);
            res.status(200).json(insumo);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === 'INSUMO_NAO_ENCONTRADO') {
                    return res.status(404).json({ error: "Insumo não encontrado" });
                };
                if (error.message === 'ESTOQUE_NAO_ENCONTRADO') {
                    return res.status(404).json({ error: "Estoque do insumo não encontrado" });
                }
                return res.status(400).json({ error: error.message });
            };
            return res.status(500).json({ error: 'Erro ao buscar insumo por ID' });
        };
    };

    public async buscarPorDescricao(req: Request, res: Response) {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({ erros: erros.array() });
        }

        try {
            const dto: BuscarInsumoPorDescricaoDTO = {
                descricao: String(req.query.descricao),
                idPropriedade: Number(req.query.idPropriedade)
            };
            const insumo = await this.insumoService.buscarPorDescricao(dto, req.session.idUsuario!);
            res.status(200).json(insumo);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === 'INSUMO_NAO_ENCONTRADO') {
                    return res.status(404).json({ error: "Nenhum insumo encontrado com essa descrição" });
                };
                if (error.message === 'ACESSO_NEGADO') {
                    return res.status(403).json({ error: 'Estoque não pôde ser acessado' });
                };
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro ao buscar insumo por descrição' });
        };
    };

    public async listarTodos(req: Request, res: Response) {
        try {
            const dto: BuscarTodosInsumosDTO = { 
                idPropriedade: Number(req.query.idPropriedade)
            };
            const insumos = await this.insumoService.listarTodos(dto, req.session.idUsuario!);
            res.status(200).json(insumos);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'SEM_INSUMOS') {
                    return res.status(404).json({ error: "Nenhum insumo cadastrado" });
                }
                if (error.message === 'ACESSO_NEGADO') {
                    return res.status(403).json({ error: 'Estoque não pôde ser acessado' });
                }
                return res.status(400).json({ error: error.message });
            };
            return res.status(500).json({ error: 'Erro ao listar todos os insumos' });
        };
    };
}

export default InsumoController;