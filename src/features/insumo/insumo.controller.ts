import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import InsumoService from './insumo.service';
import { BuscarInsumoPorDescricaoDTO, BuscarInsumoPorIdDTO, CadastrarInsumoDTO } from './insumo.dto';

export class InsumoController {
    constructor(private readonly insumoService: InsumoService) {}

    public async cadastrar(req: Request, res: Response) {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({ erros: erros.array() });
        };

        try {
            const dto: CadastrarInsumoDTO = req.body;
            const idGerado = await this.insumoService.cadastrar(dto);
            
            res.status(201).json({ mensagem: 'Insumo cadastrado com sucesso'});
        } catch (error: unknown) {
            return res.status(500).json({ error: 'Erro ao cadastrar insumo' });
        };
    };

    public async buscarPorId(req: Request, res: Response) {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({ erros: erros.array() });
        };

        try {
            const dto: BuscarInsumoPorIdDTO = {
                id: Number(req.params.id)
            };
            const insumo = await this.insumoService.buscarPorId(dto);
            res.status(200).json(insumo);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === 'INSUMO_NAO_ENCONTRADO') {
                    return res.status(404).json({ error: "Insumo não encontrado" });
                };
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
                descricao: String(req.params.descricao)
            };
            const insumo = await this.insumoService.buscarPorDescricao(dto);
            res.status(200).json(insumo);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === 'INSUMO_NAO_ENCONTRADO') {
                    return res.status(404).json({ error: "Nenhum insumo encontrado com essa descrição" });
                }
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro ao buscar insumo por descrição' });
        };
    };

    public async listarTodos(req: Request, res: Response) {
        try {
            const insumos = await this.insumoService.listarTodos();
            res.status(200).json(insumos);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'SEM_INSUMOS') {
                    return res.status(404).json({ error: "Nenhum insumo cadastrado" });
                }
                return res.status(400).json({ error: error.message });
            };
            return res.status(500).json({ error: 'Erro ao listar todos os insumos' });
        };
    };
}

export default InsumoController;