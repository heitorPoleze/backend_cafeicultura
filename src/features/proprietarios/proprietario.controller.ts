import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ProprietarioService from "./proprietario.service";

class ProprietarioController {
  constructor(private service: ProprietarioService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const id = await this.service.cadastrar(req.body);
      res.status(201).json({ mensagem: "Proprietário cadastrado com sucesso", id });
    } catch (error: any) {
      res.status(400).json({ mensagem: error.message });
    };
  };

  public async buscarPorId(req: Request, res: Response) {
    try {
      const dto = await this.service.buscarPorId(Number(req.params.id));
      res.status(200).json(dto);
    } catch (error: any) {
      res.status(404).json({ mensagem: error.message });
    };
  };
}

export default ProprietarioController;