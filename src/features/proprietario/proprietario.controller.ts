import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ProprietarioService from "./proprietario.service"
//Cadê o getter de proprietário para que ele consiga visualizar seus dados cadastrais? O interessante é retornar inclusive junto a um getter de endereço, já que estamos permitindo que ele possa atualizá-lo.
//feito
//O frontend precisa que as mensagens de sucesso de getters(obviamente), posts e puts sejam enviados com o domínio mapeado. Mais informações em https://trello.com/c/BBERi2sS/312-issue-backend-n%C3%A3o-est%C3%A1-retornando-dados-do-dom%C3%ADnio-em-post-e-put.
//falta finalizar, Pessoa model ta feito, falta outros 
//onde estão os métodos de atualizar nome, razao social, inscricao estadual? É regra de negócio que não pode ser alterado?
//feito
class ProprietarioController {
  constructor(private service: ProprietarioService) { }

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    try {
      let result = await this.service.cadastrar(req.body);
      res.status(201).json({ mensagem: "Proprietário cadastrado com sucesso", dados: result });
      
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    };
  };

  public async criarEndereco(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
    try {
      const pessoaId = Number(req.params.id);
      // O corpo da requisição deve ser validado antes de passar ao service
      let endereco = await this.service.criarEndereco(req.body, pessoaId);
      res.status(201).json({ mensagem: "Endereço adicionado com sucesso", Endereco: endereco});
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    };
  };

  public async atualizarEndereco(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      let endereco = await this.service.atualizarEndereco(id, req.body);
      res.status(200).json({ mensagem: "Endereço atualizado com sucesso.", Endereco: endereco });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    };
  };

  public async removerEndereco(req: Request, res: Response) {
    try {
      const pessoaId = Number(req.params.id);
      await this.service.removerEndereco(pessoaId);
      res.status(200).json({ mensagem: "Endereço removido com sucesso" });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    };
  };
  
public async atualizarSenha(req: Request, res: Response) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }

  try {
    const pessoaId = Number(req.params.id);
    const { senha } = req.body; 
    await this.service.atualizarSenha(senha, pessoaId);

    res.status(200).json({ mensagem: "Senha atualizada com sucesso" });
  } catch (error: unknown) {
    res.status(400).json({ mensagem: (error as Error).message });
  }
}

public async atualizarEmail(req: Request, res: Response) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }

  try {
    const pessoaId = Number(req.params.id);
    const { email } = req.body; 
    const emailAtualizado = await this.service.atualizarEmail(email, pessoaId);

    res.status(200).json({ 
      mensagem: "Email atualizado com sucesso", 
      email: emailAtualizado 
    });
  } catch (error: unknown) {
    res.status(400).json({ mensagem: (error as Error).message });
  }
}

 public async atualizarTelefone(req: Request, res: Response) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }

  try {
    const { telefone } = req.body; 
    await this.service.atualizarTelefone(telefone, Number(req.params.id));
    res.status(200).json({ mensagem: "Telefone atualizado com sucesso", telefone });
  } catch (error: unknown) {
    res.status(400).json({ mensagem: (error as Error).message });
  }
}
  public async atualizarNomeOuRazaoSocial(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    try {
      const pessoaId = Number(req.params.id);
      await this.service.atualizarNomeOuRazaoSocial(req.body, pessoaId);
      res.status(200).json({ mensagem: "Nome ou Razão Social atualizadas com sucesso.", novaInformacao: req.body });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message })
    }
  }
  public async atualizarInscricaoEstadual(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    try {
      const pessoaId = Number(req.params.id);
      const { inscricaoEstadual, cnpj } = req.body;
      await this.service.atualizarInscricaoEstadual(inscricaoEstadual, cnpj, pessoaId);
      res.status(200).json({ mensagem: "Atualização de Inscrição Estadual feita com sucesso.", novaInscricaoEstadual: inscricaoEstadual });
    } catch (error: unknown) {
      res.status(400).json({ mensagem: (error as Error).message });
    }
  }
public async getProprietarioEEndereco(req: Request, res: Response) {
  try {
    const pessoaId = Number(req.params.id);
    if (Number.isNaN(pessoaId)) {
      return res.status(400).json({ mensagem: "ID de pessoa inválido." });
    }
    const resultado = await this.service.getProprietarioEEndereco(pessoaId);
    res.status(200).json(resultado);
  } catch (error: unknown) {
    res.status(400).json({ mensagem: (error as Error).message });
  }
}
}

export default ProprietarioController;