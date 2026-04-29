import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ConsultorTecnicoServico from "../modelos/servicos/ConsultorTecnicoServico";
import conexao from "../config/conexao";

class ConsultorTecnicoControle {
  private _consultorServico: ConsultorTecnicoServico;

  constructor() {
    this._consultorServico = new ConsultorTecnicoServico(conexao);
  }

  public async cadastrar(req: Request, res: Response): Promise<void> {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      res.status(400).json({ erros: erros.array() });
      return;
    }

    try {
      const { email, telefone, senha, nome, cpf } = req.body;

      await this._consultorServico.cadastrar(email, telefone, senha, nome, cpf);

      res.status(201).json({ mensagem: "Consultor Técnico cadastrado com sucesso" });
    } catch (error: any) {
      if (error.message === "ERRO_CADASTRAR_CONSULTOR_TECNICO") {
        res.status(500).json({ mensagem: "Erro ao cadastrar o consultor técnico" });
      } else {
        console.error("Erro ao cadastrar o consultor técnico:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
    }
  }

  public async buscarPorId(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ mensagem: "ID inválido" });
      return;
    }
    try {
      const consultor = await this._consultorServico.buscarPorId(id);
      res.status(200).json(consultor);
    } catch (error: any) {
      if (error.message === "CONSULTOR_TECNICO_NAO_ENCONTRADO") {
        res.status(404).json({ mensagem: "Consultor Técnico não encontrado" });
      } else {
        res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
    }
  }

  public async listarOuBuscar(req: Request, res: Response): Promise<void> {
    const { cpf } = req.query;

    try {
      if (cpf && typeof cpf === "string") {
        const consultor = await this._consultorServico.buscarPorCpf(cpf);
        if (!consultor) throw new Error("CONSULTOR_TECNICO_NAO_ENCONTRADO");
        res.status(200).json(consultor);
        return;
      }

      res.status(400).json({ mensagem: "Forneça um CPF válido para a busca." });
    } catch (error: any) {
      if (error.message === "CONSULTOR_TECNICO_NAO_ENCONTRADO") {
        res.status(404).json({ mensagem: "Consultor Técnico não encontrado" });
      } else {
        res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
    }
  }
}

export default ConsultorTecnicoControle;