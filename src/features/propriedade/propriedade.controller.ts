import { Request, Response } from "express";
import { validationResult } from "express-validator";
import PropriedadeService from "./propriedade.service";

class PropriedadeController {
  constructor(private service: PropriedadeService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const idUsuario = req.session.idUsuario!; 
      await this.service.cadastrar(req.body, idUsuario);
      
      res.status(201).json({ mensagem: "Propriedade cadastrada com sucesso" });
    } catch (error: unknown) {
      res.status(403).json({ error: (error as Error).message }); // 403 Forbidden ou 400
    };
  };

  public async buscarPorId(req: Request, res: Response) {
    try {
      const idUsuario = req.session.idUsuario!;
      const propriedade = await this.service.buscarPorId(Number(req.params.id), idUsuario);
      
      res.status(200).json(propriedade);
    } catch (error: unknown) {
      res.status((error as Error).message.includes("Acesso negado") ? 403 : 404).json({ error: (error as Error).message });
    };
  };

  public async atualizarNome(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      await this.service.atualizarNome(Number(req.params.id), req.body, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Nome da propriedade atualizado com sucesso!" });
    } catch (error: unknown) {
      res.status((error as Error).message.includes("Acesso negado") ? 403 : 400).json({ error: (error as Error).message });
    };
  };

  public async atualizarTamanho(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      await this.service.atualizarTamanho(Number(req.params.id), req.body, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Tamanho da propriedade atualizado com sucesso!" });
    } catch (error: unknown) {
      res.status((error as Error).message.includes("Acesso negado") ? 403 : 400).json({ error: (error as Error).message });
    };
  };

  public async atualizarEndereco(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      await this.service.atualizarEndereco(Number(req.params.id), req.body, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Endereço da propriedade atualizado com sucesso!" });
    } catch (error: unknown) {
      res.status((error as Error).message.includes("Acesso negado") ? 403 : 400).json({ error: (error as Error).message });
    };
  };
};

export default PropriedadeController;