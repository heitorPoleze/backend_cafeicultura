import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ProprietarioService from "./proprietario.service";

class ProprietarioController {
  constructor(private service: ProprietarioService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    try {
      await this.service.cadastrar(req.body);
      res.status(201).json({ mensagem: "Proprietário cadastrado com sucesso"});
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(409).json({ error: "CPF já cadastrado" });
        } else if (error.message === "CNPJ_EXISTENTE") {
          return res.status(409).json({ error: "CNPJ já cadastrado" });
        }  else if (error.message === "EMAIL_EXISTENTE") {
          return res.status(409).json({ error: "Email já cadastrado" });
        } else if (error.message === "TELEFONE_EXISTENTE") {
          return res.status(409).json({ error: "Telefone já cadastrado" });
        };
        return res.status(500).json({ error: "Erro ao cadastrar proprietário" });
      }
    };
  };
  
  public async criarEndereco(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    try {
      const pessoaId = Number(req.params.id);
      await this.service.criarEndereco(req.body, pessoaId);
      res.status(201).json({ mensagem: "Endereço adicionado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: "Erro ao adicionar endereço" });
      };
    };
  };

   public async atualizarEndereco(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.service.atualizarEndereco(id, req.body);
      res.status(200).json({ mensagem: "Endereço atualizado com sucesso." });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: "Erro ao atualizar endereço" });
      };
    };
  };

  public async removerEndereco(req: Request, res: Response) {
    try {
      const pessoaId  = Number(req.params.id);
      await this.service.removerEndereco(pessoaId);
      res.status(200).json({ mensagem: "Endereço removido com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: "Erro ao remover endereço" });
      };
    };
  };

}

export default ProprietarioController;