import { conexao } from "../../config/sql";
import { ProprietarioRepository } from "../../repositories/ProprietarioRepository";
import { ProprietarioService } from "../../services/ProprietarioService";
import { Request, Response } from "express";
export class ProprietarioController {
    async cadastrarProprietario(req: Request, res: Response): Promise<void> {
        const repProprietario = new ProprietarioRepository(conexao);
        const serviceProprietario = new ProprietarioService(repProprietario);
        try{
            const novoProprietario = await serviceProprietario.cadastrarProprietario(req.body);
            res.status(201).json(novoProprietario.toJSON());
        }
        catch (error) {
            if (error instanceof Error){
                res.status(400).json({message: error.message });
            }else{
                res.status(500).json({message: "Erro desconhecido ao criar proprietário." });
            }
        }
    }
}