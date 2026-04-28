import { Request, Response } from "express";
import { conexao } from "../../config/sql";
import { PropriedadeService } from "../../services/PropriedadeService";
export class PropriedadeController {
    async cadastrarPropriedade(req: Request, res: Response): Promise<void> {
        const servicePropriedade = new PropriedadeService(conexao);
        try{
            const novaPropriedade = await servicePropriedade.cadastrarPropriedade(req.body);
            res.status(201).json(novaPropriedade.toJSON());
        }
        catch (error) {
            if (error instanceof Error){
                res.status(400).json({message: error.message });
            }else{
                res.status(500).json({message: "Erro desconhecido ao criar propriedade." });
            }
        }
    }

    async buscarPropriedadeCompletaPorId(req: Request, res: Response): Promise<void> {
        const servicePropriedade = new PropriedadeService(conexao);;
        try {
            const propriedade = await servicePropriedade.buscarPropriedadeCompletaPorId(Number(req.params.id));
            res.json(propriedade);
        } catch (error) {
            if (error instanceof Error) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Erro desconhecido ao buscar propriedade." });
            }
        }
    }
}