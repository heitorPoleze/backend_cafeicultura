import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ConsultorTecnicoService from "./consultor.service";
import { CreateConsultorDTO } from "./consultor.dto";

class ConsultorTecnicoController {
  constructor(private consultorService: ConsultorTecnicoService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    try {
      const dto: CreateConsultorDTO = req.body;
      const novoId = await this.consultorService.cadastrar(dto);
      
      res.status(201).json({ 
        mensagem: "Consultor Técnico cadastrado com sucesso", 
        id: novoId 
      });
    } catch (error: unknown) {
      const mensagem = error instanceof Error ? error.message : "Erro ao cadastrar consultor técnico:" ;
      res.status(400).json({ mensagem });
    };
  };
}

export default ConsultorTecnicoController;