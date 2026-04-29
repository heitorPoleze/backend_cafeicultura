import { Request, Response } from "express";
import { conexao } from "../../config/sql";
import { PropriedadeService } from "../../services/PropriedadeService";
export class PropriedadeController {
    async cadastrarPropriedade(req: Request, res: Response): Promise<void> {
        const servicePropriedade = new PropriedadeService(conexao);
        try {
            const novaPropriedade = await servicePropriedade.cadastrarPropriedade(req.body);
            res.status(201).json(novaPropriedade.toJSON());
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Erro desconhecido ao criar propriedade." });
            }
        }
    }

    async buscarPropriedadeCompletaPorId(req: Request, res: Response): Promise<Response> {
        const servicePropriedade = new PropriedadeService(conexao);
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) 
                return res.status(400).json({ message: "ID inválido." });

            const propriedade = await servicePropriedade.buscarPropriedadeCompletaPorId(id);
            if (!propriedade) 
                return res.status(404).json({ message: "Propriedade não encontrada." });
            
            return res.status(200).json(propriedade);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ message });
        }
    }

    async buscarPropriedadesPorProprietarioId(req: Request, res: Response): Promise<Response> {
        const servicePropriedade = new PropriedadeService(conexao);
        try {
            const proprietarioId = Number(req.params.id_proprietario);
            if (isNaN(proprietarioId)) 
                return res.status(400).json({ message: "ID do proprietário inválido." });

            const propriedades = await servicePropriedade.buscarPropriedadesPorProprietarioId(proprietarioId);
            return res.status(200).json(propriedades);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ message });
        }
    }
}