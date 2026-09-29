import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ProprietarioService from "./proprietario.service"

const CONFLITOS_CADASTRO = new Set([
  "CPF_EXISTENTE",
  "CNPJ_EXISTENTE",
  "EMAIL_EXISTENTE",
  "TELEFONE_EXISTENTE",
  "INSCRICAO_EXISTENTE",
]);

class ProprietarioController {
  constructor(private service: ProprietarioService) {}

  private tratarConflitoCadastro(error: Error, res: Response): boolean {
    if (CONFLITOS_CADASTRO.has(error.message)) {
      res.status(409).json({
        error: "Não foi possível concluir a operação. Um ou mais dados informados já estão associados a um registro existente.",
      });
      return true;
    }
    return false;
  }

  private tratarErroComum(error: unknown, res: Response, mensagemErroServidor: string) {
    if (error instanceof Error) {
      if (error.message === "NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Proprietário não encontrado" });
      }
      if (error.message === "ACESSO_NEGADO") {
        return res.status(403).json({ error: "Acesso negado" });
      }
    }
    console.error(`[Erro no Controller]: ${mensagemErroServidor}`, error);
    return res.status(500).json({ error: "Ocorreu um erro interno ao processar a solicitação." });
  }

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    
    try {
      let result = await this.service.cadastrar(req.body);
      return res.status(201).json({ mensagem: "Proprietário cadastrado com sucesso", dados: result });
    } catch (error: unknown) {
      if (error instanceof Error && this.tratarConflitoCadastro(error, res)) return;
      return this.tratarErroComum(error, res, "Erro ao cadastrar proprietário");
    }
  }

  public async criarEndereco(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    
    try {
      const pessoaId = Number(req.params.id);
      let endereco = await this.service.criarEndereco(req.body, pessoaId, req.session.idUsuario!);
      return res.status(201).json({ mensagem: "Endereço adicionado com sucesso", Endereco: endereco });
    } catch (error: unknown) {
      return this.tratarErroComum(error, res, "Erro ao adicionar endereço");
    }
  }

  public async atualizarEndereco(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      let endereco = await this.service.atualizarEndereco(id, req.body, req.session.idUsuario!);
      return res.status(200).json({ mensagem: "Endereço atualizado com sucesso.", Endereco: endereco });
    } catch (error: unknown) {
      return this.tratarErroComum(error, res, "Erro ao atualizar endereço");
    }
  }

  public async removerEndereco(req: Request, res: Response) {
    try {
      const pessoaId = Number(req.params.id);
      await this.service.removerEndereco(pessoaId, req.session.idUsuario!);
      return res.status(200).json({ mensagem: "Endereço removido com sucesso" });
    } catch (error: unknown) {
      return this.tratarErroComum(error, res, "Erro ao remover endereço");
    }
  }
  
  public async atualizarSenha(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const pessoaId = Number(req.params.id);
      const { senha } = req.body; 
      await this.service.atualizarSenha(senha, pessoaId, req.session.idUsuario!);
      return res.status(200).json({ mensagem: "Senha atualizada com sucesso" });
    } catch (error: unknown) {
      return this.tratarErroComum(error, res, "Erro ao atualizar senha");
    }
  }

  public async atualizarEmail(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const pessoaId = Number(req.params.id);
      const { email } = req.body; 
      const emailAtualizado = await this.service.atualizarEmail(email, pessoaId, req.session.idUsuario!);
      return res.status(200).json({ mensagem: "Email atualizado com sucesso", email: emailAtualizado });
    } catch (error: unknown) {
      if (error instanceof Error && this.tratarConflitoCadastro(error, res)) return;
      return this.tratarErroComum(error, res, "Erro ao atualizar email");
    }
  }

  public async atualizarTelefone(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const { telefone } = req.body; 
      await this.service.atualizarTelefone(telefone, Number(req.params.id), req.session.idUsuario!);
      return res.status(200).json({ mensagem: "Telefone atualizado com sucesso", telefone });
    } catch (error: unknown) {
      if (error instanceof Error && this.tratarConflitoCadastro(error, res)) return;
      return this.tratarErroComum(error, res, "Erro ao atualizar telefone");
    }
  }

  public async atualizarNomeOuRazaoSocial(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const pessoaId = Number(req.params.id);
      await this.service.atualizarNomeOuRazaoSocial(req.body, pessoaId, req.session.idUsuario!);
      return res.status(200).json({ mensagem: "Nome ou Razão Social atualizadas com sucesso.", novaInformacao: req.body });
    } catch (error: unknown) {
      return this.tratarErroComum(error, res, "Erro ao atualizar Nome ou Razão Social");
    }
  }

  public async atualizarInscricaoEstadual(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const pessoaId = Number(req.params.id);
      const { inscricaoEstadual } = req.body;
      await this.service.atualizarInscricaoEstadual(inscricaoEstadual, pessoaId, req.session.idUsuario!);
      return res.status(200).json({ mensagem: "Atualização de Inscrição Estadual feita com sucesso.", novaInscricaoEstadual: inscricaoEstadual });
    } catch (error: unknown) {
      if (error instanceof Error && this.tratarConflitoCadastro(error, res)) return;
      return this.tratarErroComum(error, res, "Erro ao atualizar Inscrição Estadual");
    }
  }

  public async getProprietarioEEndereco(req: Request, res: Response) {
    try {
      const pessoaId = Number(req.params.id);
      if (Number.isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido." });
      
      const resultado = await this.service.getProprietarioEEndereco(pessoaId, req.session.idUsuario!);
      return res.status(200).json(resultado);
    } catch (error: unknown) {
      return this.tratarErroComum(error, res, "Erro ao buscar proprietário e endereço");
    }
  }

  public async deletarProprietario(req: Request, res: Response) {
    try {
      const pessoaId = Number(req.params.id);
      if (Number.isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido." });
      
      await this.service.deletarProprietario(pessoaId, req.session.idUsuario!);
      return res.status(200).json({ mensagem: "Proprietário deletado com sucesso." });
    } catch (error: unknown) {
      return this.tratarErroComum(error, res, "Erro ao deletar proprietário");
    }
  }
}

export default ProprietarioController;