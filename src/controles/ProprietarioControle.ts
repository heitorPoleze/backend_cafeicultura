import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ProprietarioServico from "../modelos/servicos/ProprietarioServico";
import conexao from "../config/conexao";

class ProprietarioControle {
  private _proprietarioServico: ProprietarioServico;

  constructor() {
    this._proprietarioServico = new ProprietarioServico(conexao);
  }

  public async cadastrar(req: Request, res: Response): Promise<void> {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      res.status(400).json({ erros: erros.array() });
      return;
    }

    try {
      const { email, telefone, senha, tipoPessoa } = req.body;

      if (tipoPessoa === "fisica") {
        const { nome, cpf } = req.body;
        await this._proprietarioServico.cadastrarFisica(
          email,
          telefone,
          senha,
          nome,
          cpf,
        );
      } else if (tipoPessoa === "juridica") {
        const { razaoSocial, cnpj, inscrEstadual } = req.body;
        await this._proprietarioServico.cadastrarJuridica(
          email,
          telefone,
          senha,
          razaoSocial,
          cnpj,
          inscrEstadual,
        );
      } else {
        res
          .status(400)
          .json({ mensagem: "Tipo de pessoa inválido. Use 'fisica' ou 'juridica'." });
        return;
      }

      res.status(201).json({ mensagem: "Proprietário cadastrado com sucesso" });
    } catch (error: any) {
      switch (error.message) {
        case "ERRO_CADASTRAR_PROPRIETARIO_FISICA":
        case "ERRO_CADASTRAR_PROPRIETARIO_JURIDICA":
          res
            .status(500)
            .json({
              mensagem: "Erro ao cadastrar o proprietário no banco de dados",
            });
          break;
        default:
          console.log(error);
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
      const proprietario = await this._proprietarioServico.buscarPorId(id);
      res.status(200).json(proprietario);
    } catch (error: any) {
      if (error.message === "PROPRIETARIO_NAO_ENCONTRADO") {
        res.status(404).json({ mensagem: "Proprietário não encontrado" });
      } else {
        res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
    }
  }

  public async listarOuBuscar(req: Request, res: Response): Promise<void> {
    const { cpf, cnpj } = req.query;

    try {
      if (cpf && typeof cpf === "string") {
        const proprietario = await this._proprietarioServico.buscarPorCpf(cpf);
        if (!proprietario) throw new Error("PROPRIETARIO_NAO_ENCONTRADO");
        res.status(200).json(proprietario);
        return;
      }

      if (cnpj && typeof cnpj === "string") {
        const proprietario =
          await this._proprietarioServico.buscarPorCnpj(cnpj);
        if (!proprietario) throw new Error("PROPRIETARIO_NAO_ENCONTRADO");
        res.status(200).json(proprietario);
        return;
      }

      res
        .status(400)
        .json({ mensagem: "Forneça um CPF ou CNPJ válido para a busca." });
    } catch (error: any) {
      if (error.message === "PROPRIETARIO_NAO_ENCONTRADO") {
        res.status(404).json({ mensagem: "Proprietário não encontrado" });
      } else {
        res.status(500).json({ mensagem: "Erro interno do servidor" });
      }
    }
  }
}

export default ProprietarioControle;
