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
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    };
  };

  public async buscarPorId(req: Request, res: Response) {
    try {
      const dto = await this.service.buscarPorId(Number(req.params.id));
      if (!dto) {
        return res.status(404).json({ mensagem: "Proprietário não encontrado." });
      }
      res.status(200).json(dto);
    } catch (error: unknown) {
      res.status(500).json({ mensagem: (error as Error).message || "Erro interno ao buscar proprietário." });
    };
  };

  
  public async criarEndereco(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    try {
      const pessoaId = Number(req.params.id);
      // O corpo da requisição deve ser validado antes de passar ao service
      const novoId = await this.service.criarEndereco(req.body, pessoaId);
      res.status(201).json({ mensagem: "Endereço adicionado com sucesso", id: novoId });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    }
  }

  public async removerEndereco(req: Request, res: Response) {
    try {
      const pessoaId  = Number(req.params.id);
      await this.service.removerEndereco(pessoaId);
      res.status(200).json({ mensagem: "Endereço removido com sucesso" });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    };
  };

  public async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.service.excluir(id);
      res.status(200).json({ mensagem: "Proprietário e todos os dados vinculados foram removidos com sucesso." });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    }
  }

  public async atualizar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    try {
      const id = Number(req.params.id);
      await this.service.atualizar(id, req.body);
      res.status(200).json({ mensagem: "Dados do proprietário atualizados com sucesso." });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    }
  }

  public async atualizarEndereco(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.service.atualizarEndereco(id, req.body);
      res.status(200).json({ mensagem: "Endereço atualizado com sucesso." });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    }
  }
}

export default ProprietarioController;