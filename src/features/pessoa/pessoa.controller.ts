import { Request, Response } from "express";
import { validationResult } from "express-validator";
import PessoaService from "./pessoa.service";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import {
  CreateClienteDTO,
  CreateFornecedorDTO,
  CreateFuncionarioDTO,
  CreateMeeiroDTO,
  CreatePrestadorDTO,
  ExcluirPessoaDTO,
} from "./pessoa.dto";
import { TipoPapel } from "../../shared/domain/pessoa/pessoa.dto";
import Formatador from "../../shared/utils/Formatador";

class PessoaController {
  private static readonly ERROS_CONFLITO_DOCUMENTO: Record<string, string> = {
    CPF_EXISTENTE: "CPF já cadastrado",
    CNPJ_EXISTENTE: "CNPJ já cadastrado",
    INSCRICAO_ESTADUAL_EXISTENTE: "Inscrição estadual já cadastrada",
  };

  private static readonly MAPA_TITULO_PAPEL: Record<TipoPapel, string> = {
    cliente: "Cliente",
    fornecedor: "Fornecedor",
    funcionario: "Funcionário",
    meeiro: "Meeiro",
    prestadordeservico: "Prestador de Serviço",
  };

  constructor(private service: PessoaService) {}

  private obterErroValidacao(req: Request, res: Response): Response | null {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    return null;
  }

  private criarEnderecoDeRequisicao(req: Request): Endereco {
    return new Endereco(
      req.body.cidade,
      req.body.bairro,
      req.body.cep,
      req.body.uf,
      req.body.pais,
      req.body.logradouro,
      req.body.idEndereco,
    );
  }

  private formatarMensagemNomeDuplicado(entidadeTitulo: string, req: Request): string {
    const isJuridica = req.body.tipoPessoa === "juridica" || Boolean(req.body.razaoSocial);
    const campo = isJuridica ? "esta razão social" : "este nome";
    return `Já existe ${entidadeTitulo} com ${campo}`;
  }

  private async executarCadastro<T>(
    req: Request,
    res: Response,
    acao: (dados: T) => Promise<unknown>,
    entidadeTitulo: string,
  ) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      req.body.idAdministrador = req.session.idUsuario!;
      await acao(req.body);
      return res.status(201).json({ mensagem: `${Formatador.capitalizar(entidadeTitulo)} cadastrado com sucesso` });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.startsWith("NOME_DUPLICADO")) {
          return res.status(409).json({
            error: this.formatarMensagemNomeDuplicado(entidadeTitulo, req),
          });
        }

        const mensagemConflitoDoc = PessoaController.ERROS_CONFLITO_DOCUMENTO[error.message];
        if (mensagemConflitoDoc) {
          return res.status(409).json({ error: mensagemConflitoDoc });
        }

        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno ao realizar cadastro" });
    }
  }

  private async executarBusca(
    res: Response,
    acao: () => Promise<unknown>,
    entidadeTitulo: string,
  ) {
    const entidadeMinuscula = entidadeTitulo.toLowerCase();
    try {
      const resultado = await acao();
      return res.status(200).json(resultado);
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NAO_ENCONTRADO":
            return res.status(404).json({ error: `${entidadeTitulo} não encontrado` });
          case "ACESSO_NEGADO":
            return res.status(403).json({ error: `Acesso negado! Não pode visualizar ${entidadeMinuscula}` });
          case "ERRO_AO_BUSCAR":
            return res.status(500).json({ error: `Erro ao buscar ${entidadeMinuscula}` });
          default:
            return res.status(500).json({ error: error.message });
        }
      }
      return res.status(500).json({ error: `Erro ao buscar ${entidadeMinuscula}` });
    }
  }

  private async executarExclusao(
    req: Request,
    res: Response,
    acao: (dto: ExcluirPessoaDTO, idUsuario: number) => Promise<unknown>,
    entidadeTitulo: string,
    codigoAssociacao: string,
    statusAssociacao = 403,
  ) {
    const entidadeMinuscula = entidadeTitulo.toLowerCase();
    try {
      const dto: ExcluirPessoaDTO = { id: Number(req.params.id) };
      await acao(dto, req.session.idUsuario!);
      return res.status(200).json({ mensagem: `${entidadeTitulo} excluído com sucesso` });
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NAO_ENCONTRADO":
            return res.status(404).json({ error: `${entidadeTitulo} não encontrado` });
          case "ACESSO_NEGADO":
            return res.status(403).json({ error: `Acesso negado! Não pode excluir ${entidadeMinuscula}` });
          case codigoAssociacao:
            return res.status(statusAssociacao).json({
              error: `${entidadeTitulo} possui associações e não pode ser excluído`,
            });
          case "ERRO_AO_EXCLUIR":
            return res.status(500).json({ error: `Erro ao excluir ${entidadeMinuscula}` });
          default:
            return res.status(500).json({ error: error.message });
        }
      }
      return res.status(500).json({ error: `Erro ao excluir ${entidadeMinuscula}` });
    }
  }

  public async cadastrarCliente(req: Request, res: Response) {
    return this.executarCadastro(
      req,
      res,
      (dados: CreateClienteDTO) => this.service.cadastrarCliente(dados),
      "cliente",
    );
  }

  public async cadastrarFornecedor(req: Request, res: Response) {
    return this.executarCadastro(
      req,
      res,
      (dados: CreateFornecedorDTO) => this.service.cadastrarFornecedor(dados),
      "fornecedor",
    );
  }

  public async cadastrarFuncionario(req: Request, res: Response) {
    return this.executarCadastro(
      req,
      res,
      (dados: CreateFuncionarioDTO) => this.service.cadastrarFuncionario(dados),
      "funcionário",
    );
  }

  public async cadastrarMeeiro(req: Request, res: Response) {
    return this.executarCadastro(
      req,
      res,
      (dados: CreateMeeiroDTO) => this.service.cadastrarMeeiro(dados),
      "meeiro",
    );
  }

  public async cadastrarPrestador(req: Request, res: Response) {
    return this.executarCadastro(
      req,
      res,
      (dados: CreatePrestadorDTO) => this.service.cadastrarPrestador(dados),
      "prestador de serviço",
    );
  }

  public async atualizarFuncionarioSalario(req: Request, res: Response) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      await this.service.atualizarFuncionarioSalario(
        {
          id: Number(req.params.id),
          salario: req.body.salario,
        },
        req.session.idUsuario!,
      );

      return res.status(200).json({ mensagem: "Salário atualizado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NAO_ENCONTRADO":
            return res.status(404).json({ error: "Funcionário não encontrado" });
          case "ACESSO_NEGADO":
            return res.status(403).json({ error: "Acesso negado! Não pode atualizar salário" });
          case "NAO_ATUALIZADO":
            return res.status(500).json({ error: "Erro ao atualizar salário" });
          default:
            return res.status(500).json({ error: error.message });
        }
      }
      return res.status(500).json({ error: "Erro ao atualizar salário" });
    }
  }

  public async buscarClientePorId(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarClientePorId(Number(req.params.id), req.session.idUsuario!),
      "Cliente",
    );
  }

  public async buscarFornecedorPorId(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarFornecedorPorId(Number(req.params.id), req.session.idUsuario!),
      "Fornecedor",
    );
  }

  public async buscarFuncionarioPorId(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarFuncionarioPorId(Number(req.params.id), req.session.idUsuario!),
      "Funcionário",
    );
  }

  public async buscarMeeiroPorId(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarMeeiroPorId(Number(req.params.id), req.session.idUsuario!),
      "Meeiro",
    );
  }

  public async buscarPrestadorPorId(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarPrestadorPorId(Number(req.params.id), req.session.idUsuario!),
      "Prestador de Serviço",
    );
  }

  public async buscarFuncionarioPorIdAdministrador(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarFuncionariosPorIdAdministrador(req.session.idUsuario!),
      "Funcionário",
    );
  }

  public async buscarClientesPorIdAdministrador(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarClientesPorIdAdministrador(req.session.idUsuario!),
      "Cliente",
    );
  }

  public async buscarMeeirosPorIdAdministrador(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarMeeirosPorIdAdministrador(req.session.idUsuario!),
      "Meeiro",
    );
  }

  public async buscarPrestadoresDeServicoPorIdAdministrador(req: Request, res: Response) {
    const idSessao = req.session.idUsuario!;
    if (!idSessao) {
      return res.status(403).json({ error: "Usuário não autenticado" });
    }

    return this.executarBusca(
      res,
      () => this.service.buscarPrestadoresDeServicoPorIdAdministrador(idSessao),
      "Prestador de Serviço",
    );
  }

  public async buscarFornecedoresPorIdAdministrador(req: Request, res: Response) {
    return this.executarBusca(
      res,
      () => this.service.buscarFornecedoresPorIdAdministrador(req.session.idUsuario!),
      "Fornecedor",
    );
  }

  public async listarPessoas(req: Request, res: Response) {
    try {
      const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
      const limite = req.query.limite ? Number(req.query.limite) : 10;

      const pessoas = await this.service.listarPessoas({
        idAdministrador: req.session.idUsuario!,
        pagina,
        limite,
      });

      return res.status(200).json(pessoas);
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "SEM_REGISTROS":
            return res
              .status(200)
              .json({ error: "Nenhuma pessoa cadastrada a esse ID ou Página Vazia", data: [] });
          default:
            return res.status(400).json({ error: error.message });
        }
      }
      return res.status(500).json({ error: "Erro ao listar pessoas" });
    }
  }

  public async cadastrarEnderecoPessoaGenerica(req: Request, res: Response) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      await this.service.cadastrarEnderecoPessoaGenerica(
        Number(req.params.id),
        this.criarEnderecoDeRequisicao(req),
        req.session.idUsuario!,
      );
      return res.status(201).json({ message: "Endereço cadastrado com sucesso", endereco: req.body });
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NAO_ENCONTRADO":
            return res.status(404).json({ error: "Pessoa não encontrada ou acesso negado" });
          default:
            return res.status(400).json({ error: error.message });
        }
      }
      return res.status(500).json({ error: "Erro ao cadastrar endereço" });
    }
  }

  public async atualizarEnderecoPessoaGenerica(req: Request, res: Response) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      await this.service.atualizarEnderecoPessoaGenerica(
        Number(req.params.id),
        this.criarEnderecoDeRequisicao(req),
        req.session.idUsuario!,
      );
      return res.status(200).json({ message: "Endereço atualizado com sucesso", endereco: req.body });
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NAO_ENCONTRADO":
            return res.status(404).json({ error: "Pessoa não encontrada ou acesso negado" });
          default:
            return res.status(400).json({ error: error.message });
        }
      }
      return res.status(500).json({ error: "Erro ao atualizar endereço" });
    }
  }

  public async removerEnderecoPessoaGenerica(req: Request, res: Response) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      const response = await this.service.removerEnderecoPessoaGenerica(
        Number(req.params.id),
        req.session.idUsuario!,
      );
      return res.status(200).json({ message: "Endereço removido com sucesso", response });
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NAO_ENCONTRADO":
            return res.status(404).json({ error: "Pessoa ou endereço não encontrado" });
          default:
            return res.status(400).json({ error: error.message });
        }
      }
      return res.status(500).json({ error: "Erro ao remover endereço" });
    }
  }

  public async atualizarNomeOuRazaoSocial(req: Request, res: Response) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      const pessoaId = Number(req.params.id);
      await this.service.atualizarNomeOuRazaoSocial(req.body, pessoaId, req.session.idUsuario!);
      return res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.startsWith("NOME_DUPLICADO")) {
          const [, papelExtraido] = error.message.split(":") as [string, TipoPapel | undefined];
          const entidadeTitulo =
            (papelExtraido && PessoaController.MAPA_TITULO_PAPEL[papelExtraido]) || "Pessoa";
          return res.status(409).json({
            error: this.formatarMensagemNomeDuplicado(entidadeTitulo, req),
          });
        }

        switch (error.message) {
          case "TIPO_DE_PESSOA_INVALIDO":
          case "OPERACAO_INVALIDA":
            return res.status(422).json({ error: "Tipo de pessoa inválido" });
          case "ACESSO_NEGADO":
            return res.status(403).json({ error: "Acesso negado" });
        }
      }
      return res.status(500).json({ mensagem: "Erro interno inesperado ao tentar atualizar" });
    }
  }

  public async atualizarCpf(req: Request, res: Response) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      const pessoaId = Number(req.params.id);
      const cpf = req.body.cpf;
      const resposta = await this.service.atualizarCpf(cpf, pessoaId, req.session.idUsuario!);
      return res.status(200).json({
        mensagem: "CPF Atualizado com sucesso",
        resposta: resposta?.toJSON(),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "CPF_EXISTENTE":
            return res.status(409).json({ error: "CPF já cadastrado" });
          case "TIPO_DE_PESSOA_INVALIDO":
          case "OPERACAO_INVALIDA":
            return res.status(422).json({ error: "Tipo de pessoa inválido" });
          case "ACESSO_NEGADO":
            return res.status(403).json({ error: "Acesso negado" });
          default:
            return res.status(400).json({ error: "Dados inválidos" });
        }
      }
      return res.status(500).json({ error: "Erro ao atualizar CPF" });
    }
  }

  public async atualizarCnpj(req: Request, res: Response) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      const pessoaId = Number(req.params.id);
      const cnpj = req.body.cnpj;
      const resposta = await this.service.atualizarCNPJ(cnpj, pessoaId, req.session.idUsuario!);
      return res.status(200).json({ mensagem: "CNPJ atualizado com sucesso", resposta });
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "CNPJ_EXISTENTE":
            return res.status(409).json({ error: "CNPJ já cadastrado" });
          case "CNPJ_INVALIDO":
            return res.status(404).json({ error: "CNPJ em formato inválido" });
          case "ACESSO_NEGADO":
            return res.status(403).json({ error: "Acesso negado" });
        }
      }
      return res.status(500).json({ error: "Erro ao atualizar CNPJ" });
    }
  }

  public async atualizarInscricaoEstadual(req: Request, res: Response) {
    const erroValidacao = this.obterErroValidacao(req, res);
    if (erroValidacao) return erroValidacao;

    try {
      const pessoaId = Number(req.params.id);
      const novaIE = req.body.inscricaoEstadual;
      const resposta = await this.service.atualizarInscricaoEstadual(
        novaIE,
        pessoaId,
        req.session.idUsuario!,
      );
      return res.status(200).json({ mensagem: "Inscrição Estadual atualizada com sucesso", resposta });
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "INSCRICAO_INVALIDA":
            return res.status(400).json({ error: "Inscrição estadual inválida" });
          case "INSCRICAO_EM_USO":
          case "INSCRICAO_ESTADUAL_EXISTENTE":
            return res.status(409).json({ error: "Inscrição estadual já em uso" });
          case "ACESSO_NEGADO":
            return res.status(403).json({ error: "Acesso negado" });
        }
      }
      return res.status(500).json({ error: "Erro ao atualizar Inscrição Estadual" });
    }
  }

  public async excluirCliente(req: Request, res: Response) {
    return this.executarExclusao(
      req,
      res,
      (dto, idUsuario) => this.service.excluirCliente(dto, idUsuario),
      "Cliente",
      "CLIENTE_POSSUI_ASSOCIACOES",
      400,
    );
  }

  public async excluirFornecedor(req: Request, res: Response) {
    return this.executarExclusao(
      req,
      res,
      (dto, idUsuario) => this.service.excluirFornecedor(dto, idUsuario),
      "Fornecedor",
      "FORNECEDOR_POSSUI_ASSOCIACOES",
    );
  }

  public async excluirFuncionario(req: Request, res: Response) {
    return this.executarExclusao(
      req,
      res,
      (dto, idUsuario) => this.service.excluirFuncionario(dto, idUsuario),
      "Funcionário",
      "FUNCIONARIO_POSSUI_ASSOCIACOES",
    );
  }

  public async excluirMeeiro(req: Request, res: Response) {
    return this.executarExclusao(
      req,
      res,
      (dto, idUsuario) => this.service.excluirMeeiro(dto, idUsuario),
      "Meeiro",
      "MEEIRO_POSSUI_ASSOCIACOES",
    );
  }

  public async excluirPrestador(req: Request, res: Response) {
    return this.executarExclusao(
      req,
      res,
      (dto, idUsuario) => this.service.excluirPrestador(dto, idUsuario),
      "Prestador de Serviço",
      "PRESTADOR_POSSUI_ASSOCIACOES",
    );
  }
}

export default PessoaController;