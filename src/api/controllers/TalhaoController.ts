import { Request, Response } from "express";
import { TalhaoService } from "../../services/TalhaoService";
import { conexao } from "../../config/sql";
import { CriarTalhaoDTO, TalhaoCompletoDTO } from "../dtos/TalhaoDTOs";
import { TalhaoMapper } from "../mappers/TalhaoMapper";

export class TalhaoController {
    async cadastrarTalhao(req: Request, res: Response): Promise<Response> {
        const serviceTalhao = new TalhaoService(conexao);
        
        try{    
            const talhaoDTO: CriarTalhaoDTO = req.body;

            const talhaoCadastrado = await serviceTalhao.cadastrarTalhao(talhaoDTO);

            return res.status(201).json(talhaoCadastrado.toJSON());
        } catch (error) {
            if (error instanceof Error) 
                return res.status(400).json({ message: error.message });
            return res.status(500).json({ message: "Erro desconhecido ao criar talhão." });
            }
        }

    async buscarTalhaoCompletoPorId(req: Request, res: Response): Promise<Response> {
        const serviceTalhao = new TalhaoService(conexao);
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) 
                return res.status(400).json({ message: "ID inválido." });

            const talhao = await serviceTalhao.buscarTalhaoCompletoPorId(id);
            if (!talhao) 
                return res.status(404).json({ message: "Talhão não encontrado." });

            return res.status(200).json(talhao);

        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ message });
        }
    }

    async listarPorPropriedade(req: Request, res: Response): Promise<Response> {
    const service = new TalhaoService(conexao);
    try {
        const propriedadeId = Number(req.params.id_propriedade);

        if (isNaN(propriedadeId)) {
            return res.status(400).json({ message: "ID da propriedade inválido." });
        }

        const talhoes = await service.buscarTalhoesPorPropriedadeId(propriedadeId);

        const result = talhoes.map(t => t.toJSON());

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao buscar talhões da propriedade." });
    }
}

}