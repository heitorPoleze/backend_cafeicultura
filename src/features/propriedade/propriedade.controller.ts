import { Request, Response } from "express";
import { validationResult } from "express-validator";
import PropriedadeService from "./propriedade.service";
import { ListPropriedadesDTO } from "./propriedade.dto";

class PropriedadeController {
  constructor(private service: PropriedadeService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const idUsuario = req.session.idUsuario!;
      const idPropriedade = await this.service.cadastrar(req.body, idUsuario);

      return res.status(201).json({
        mensagem: "Propriedade cadastrada com sucesso",
        dados: { id: idPropriedade },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NOME_DUPLICADO") {
          return res.status(422).json({ error: "Nome da propriedade já existe" });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: "Erro ao cadastrar propriedade" });
    };
  };

  public async buscarPorId(req: Request, res: Response) {
    try {
      const idUsuario = req.session.idUsuario!;
      const propriedade = await this.service.buscarPorId(Number(req.params.id), idUsuario);
      
      res.status(200).json(propriedade);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADA") {
          return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res.status(403).json({ error: "Acesso negado! Não foi possível buscar a propriedade" });
        };
        return res.json(500).json({ error: "Erro ao buscar propriedade" });
      };
    };
  };

  public async atualizarNome(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      await this.service.atualizarNome(Number(req.params.id), req.body, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Nome da propriedade atualizado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADA") {
          return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res.status(403).json({ error: "Acesso negado! Não foi possivel atualizar o nome da propriedade" });
        };
        return res.status(500).json({ error: "Erro ao atualizar nome da propriedade" });
      };
    };
  };

  public async atualizarTamanho(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      await this.service.atualizarTamanho(Number(req.params.id), req.body, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Tamanho da propriedade atualizado com sucesso!" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADA") {
          return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res.status(403).json({ error: "Acesso negado! Não foi possivel atualizar o tamanho da propriedade" });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: "Erro ao atualizar tamanho da propriedade" });
    };
  };

  public async atualizarEndereco(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      await this.service.atualizarEndereco(Number(req.params.id), req.body, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Endereço da propriedade atualizado com sucesso!" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADA") {
          return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res.status(403).json({ error: "Acesso negado! Não foi possivel atualizar o endereço da propriedade" });
        };
        return res.status(500).json({ error: "Erro ao atualizar endereço da propriedade" });
      };
    };
  };

  public async listarPorProprietario(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    
    try {
      const dto: ListPropriedadesDTO = {
        idProprietario: req.session.idUsuario!
      };
      const propriedades = await this.service.listarPorProprietario(dto);
      res.status(200).json(propriedades);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADA") {
          return res.status(404).json({ error: "Nenhuma propriedade encontrada" });
        };
        return res.status(500).json({ error: "Erro ao listar propriedades" });
      };
    };
  };
};

export default PropriedadeController;