import TratoCultural, { TipoTrato } from "./tratocultural.entity";
import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import {
  AlterarInicioTratoCulturalDTO,
  AtualizarDescricaoDTO,
  BuscarTratoPorIdDTO,
  CadastrarTratoCulturalDTO,
  EditarResponsaveisTratoDTO,
  EditarTratoCulturalDTO,
  ExcluirInsumosTratoDTO,
  ExcluirTransacoesTratoDTO,
  ExcluirTratoCulturalDTO,
  FinalizarTratoCulturalDTO,
  InserirInsumosTratoDTO,
  ListarTratoPorPropriedadeDTO,
  ListarTratoPorSafraDTO,
  ListarTratoPorTalhaoDTO,
  ResponseListagemTratosDTO,
  ResponseTratoCulturalDTO,
  TipoTratoDTO,
} from "./tratocultural.dto";

import TratoCulturalRepository from "./tratocultural.repository";
import SafraRepository from "../safra/safra.repository";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import InsumoRepository from "../../shared/domain/insumo/insumo.repository";
import TalhaoRepository from "../talhao/talhao.repository";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import Despesa from "../despesa/despesa.entity";
import Safra from "../safra/safra.entity";
import Talhao from "../talhao/talhao.entity";
import { Prisma, PrismaClient } from "@prisma/client";
import EstoqueInsumoRepository from "../../shared/domain/insumo/estoqueinsumo/estoqueinsumo.repository";

type ResultadoProcessamento =
  | { acao: 'INSERIR'; dados: { idTrato_PFK: number; idInsumo_PFK: number; qtdUsada: number } }
  | { acao: 'ATUALIZAR'; dados: { idInsumo_PFK: number; novaQtdTotal: number } }
  | { acao: 'NENHUMA_MUDANCA' };

type DadosInsercao = { idTrato_PFK: number; idInsumo_PFK: number; qtdUsada: number };
type DadosAtualizacao = { idInsumo_PFK: number; novaQtdTotal: number };

class TratoCulturalService {

  constructor(
    private prisma: PrismaClient,
    private tratoCulturalRepo: TratoCulturalRepository,
    private propriedadeRepo: PropriedadeRepository,
    private safraRepo: SafraRepository,
    private insumoRepo: InsumoRepository,
    private talhaoRepo: TalhaoRepository,
    private pessoaRepo: PessoaRepository,
    private estoqueRepo: EstoqueInsumoRepository
  ) { };

  private async processarItemInsumo(
    item: { idInsumo: number; qtdUsada: number },
    idTrato: number,
    idPropriedade: number,
    idUsuarioSessao: number,
    mapaExistentes: Map<number, number>,
    tx: Prisma.TransactionClient
  ): Promise<ResultadoProcessamento> {
    const insumoDomain = await this.insumoRepo.buscarPorId(item.idInsumo, idUsuarioSessao, tx);
    if (!insumoDomain) throw new Error(`INSUMO_NAO_ENCONTRADO`);

    const idInsumo = insumoDomain.id!;
    const novaQtdTotal = item.qtdUsada;

    let diferencaEstoque = 0;
    let resultadoFinal: ResultadoProcessamento;

    if (mapaExistentes.has(idInsumo)) {
      const qtdAnterior = mapaExistentes.get(idInsumo)!;
      diferencaEstoque = novaQtdTotal - qtdAnterior;

      if (diferencaEstoque !== 0) {
        resultadoFinal = { acao: 'ATUALIZAR', dados: { idInsumo_PFK: idInsumo, novaQtdTotal } };
      } else {
        resultadoFinal = { acao: 'NENHUMA_MUDANCA' };
      }
    } else {
      diferencaEstoque = novaQtdTotal;

      resultadoFinal = {
        acao: 'INSERIR',
        dados: { idTrato_PFK: idTrato, idInsumo_PFK: idInsumo, qtdUsada: novaQtdTotal }
      };
    }

    if (diferencaEstoque !== 0) {
      const estoque = await this.estoqueRepo.buscarEstoque(idInsumo, idPropriedade, idUsuarioSessao, tx);
      if (estoque) {
        if (diferencaEstoque > 0) {
          estoque.remover(diferencaEstoque);
        } else if (diferencaEstoque < 0) {
          estoque.adicionar(Math.abs(diferencaEstoque));
        }
        await this.estoqueRepo.atualizar(estoque, tx);
      }
    }

    return resultadoFinal;
  }

  private async salvarAlteracoesNoBanco(
    idTrato: number,
    novosInsumosParaInserir: DadosInsercao[],
    insumosParaAtualizar: DadosAtualizacao[],
    tx: Prisma.TransactionClient
  ): Promise<void> {

    if (insumosParaAtualizar.length > 0) {
      const promessasDeAtualizacao = insumosParaAtualizar.map(atualizacao =>
        this.tratoCulturalRepo.atualizarQtdInsumoTrato(
          idTrato,
          atualizacao.idInsumo_PFK,
          atualizacao.novaQtdTotal,
          tx
        )
      );
      await Promise.all(promessasDeAtualizacao);
    }

    if (novosInsumosParaInserir.length > 0) {
      await this.tratoCulturalRepo.inserirInsumos(novosInsumosParaInserir, tx);
    }
  };

  private async validarAcessoPropriedade(idPropriedade: number, idUsuarioSessao: number, tx: Prisma.TransactionClient): Promise<void> {
    const propriedade = await this.propriedadeRepo.buscarPorId(idPropriedade, tx);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");
  };

  private async buscarEValidarTrato(idTrato: number, idUsuarioSessao: number, tx: Prisma.TransactionClient): Promise<TratoCultural> {
    const trato = await this.tratoCulturalRepo.buscarPorId(idTrato, tx);
    if (!trato) throw new Error("TRATO_NAO_ENCONTRADO");
    await this.validarAcessoPropriedade(trato.safra.idPropriedade, idUsuarioSessao, tx);
    return trato;
  };

  private async buscarEValidarSafra(idSafra: number, tx: Prisma.TransactionClient): Promise<Safra> {
    const safra = await this.safraRepo.buscarPorId(idSafra, tx);
    if (!safra) {
      throw new Error("SAFRA_NAO_ENCONTRADA");
    };
    return safra;
  };

  private async buscarEValidarTalhao(idTalhao: number, tx: Prisma.TransactionClient): Promise<Talhao> {
    const talhao = await this.talhaoRepo.buscarPorId(idTalhao, tx);
    if (!talhao) throw new Error("TALHAO_NAO_ENCONTRADO");
    return talhao;
  }

  private async validarDescricao(descricao: string, tipoTrato: TipoTrato) {
    if (
      tipoTrato === TipoTrato.OUTROS &&
      (!descricao || descricao.trim() === "")
    ) {
      throw new Error("DESCRICAO_OBRIGATORIA");
    }

    if (descricao && descricao.trim() !== "") {
      const regexDescricao = /^(?![0-9.]+$)(?=(?:[^a-zA-Z]*[a-zA-Z]){4}).*$/;
      if (!regexDescricao.test(descricao)) {
        throw new Error("DESCRICAO_INVALIDA");
      }
    }
  }


  public async cadastrar(
    dto: CadastrarTratoCulturalDTO,
    idUsuarioSessao: number,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const executarOperacoes = async (
      tx: Prisma.TransactionClient,
    ): Promise<number> => {
      const safra = await this.buscarEValidarSafra(dto.idSafra, tx);
      await this.validarAcessoPropriedade(safra.idPropriedade, idUsuarioSessao, tx);
      const talhao = await this.buscarEValidarTalhao(dto.idTalhao, tx);

      if (talhao.idPropriedade !== safra.idPropriedade) throw new Error("ACESSO_NEGADO");

      if (!Object.values(TipoTrato).includes(dto.tipoTrato)) throw new Error("TIPO_TRATO_INVALIDO");

      await this.validarDescricao(dto.descricao, dto.tipoTrato);

      const tipoTrato = await this.tratoCulturalRepo.buscarTipoTratoPorDescricao(dto.tipoTrato, tx);

      const despesasDomain: Despesa[] = dto.transacoesFinanceiras && dto.transacoesFinanceiras.length > 0 ?
        await Promise.all(dto.transacoesFinanceiras.map(async (despesa) => {
          const pessoa = await this.pessoaRepo.buscarPorId(despesa.beneficiado, tx);
          if (!pessoa) throw new Error("PESSOA_NAO_ENCONTRADA");
          return new Despesa(
            undefined, null, despesa.idPropriedade, new Date(), despesa.valor,
            despesa.formaPagamento, despesa.tipoOperacao, pessoa, despesa.descricao,
          )
        })) : [];

      const responsaveisDomain: Pessoa[] = dto.responsaveisIds && dto.responsaveisIds.length > 0
        ? await Promise.all(dto.responsaveisIds.map(async (idPessoa) => {
          const pessoa = await this.pessoaRepo.buscarPorId(idPessoa, tx);
          if (!pessoa) throw new Error("RESPONSAVEL_NAO_ENCONTRADO");
          return pessoa;
        })) : [];

      const insumosDomain: TratoInsumo[] = dto.insumosUtilizados && dto.insumosUtilizados.length > 0
        ? await Promise.all(dto.insumosUtilizados.map(async (insumoDto) => {
          const insumoDomain = await this.insumoRepo.buscarPorId(insumoDto.idInsumo, idUsuarioSessao, tx);
          if (!insumoDomain) throw new Error("INSUMO_NAO_ENCONTRADO");
          return new TratoInsumo(insumoDomain, insumoDto.qtdUsada);
        }))
        : [];

      for (const insumo of insumosDomain) {
        let estoque = await this.estoqueRepo.buscarEstoque(insumo.insumo.id!, safra.idPropriedade, idUsuarioSessao, tx);

        if (estoque) {
          estoque.remover(insumo.qtdUsada);
          await this.estoqueRepo.atualizar(estoque, tx);
        };
      };

      const novoTrato = new TratoCultural(
        undefined, dto.idTalhao, new Date(dto.dataInicio),
        dto.dataFim ? new Date(dto.dataFim) : null,
        dto.descricao || "", new Date(), safra, despesasDomain, responsaveisDomain, dto.tipoTrato, insumosDomain
      );

      return await this.tratoCulturalRepo.cadastrar(novoTrato, tipoTrato.id, tx);
    };

    if (tx) {
      return await executarOperacoes(tx);
    } else {
      return await this.prisma.$transaction(async (novoTx) => {
        return await executarOperacoes(novoTx);
      });
    };
  };

  public async editar(
    dto: EditarTratoCulturalDTO,
    idUsuarioSessao: number,
  ): Promise<ResponseTratoCulturalDTO> {
    return await this.prisma.$transaction(async (tx) => {
      const trato = await this.buscarEValidarTrato(dto.id, idUsuarioSessao, tx);
      await this.tratoCulturalRepo.excluir(trato, tx);
      return this.buscarEValidarTrato(await this.cadastrar(dto, idUsuarioSessao, tx), idUsuarioSessao, tx);
    });
  };

  public async atualizarDescricao(dto: AtualizarDescricaoDTO, idUsuarioSessao: number): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, tx);
      await this.validarDescricao(dto.descricao, trato.tipoTrato);
      trato.descricao = dto.descricao;
      await this.tratoCulturalRepo.atualizarDescricao(trato, tx);
    })
  };

  public async editarResponsaveis(dto: EditarResponsaveisTratoDTO, idUsuarioSessao: number): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, tx);

      const responsaveis: Pessoa[] = await Promise.all(
        dto.responsaveisIds.map(async (item) => {
          const responsavelDomain = await this.pessoaRepo.buscarPorId(item, tx);
          if (!responsavelDomain) throw new Error("PESSOA_NAO_ENCONTRADA");
          return responsavelDomain;
        })
      );

      trato.editarResponsaveis(responsaveis);
      await this.tratoCulturalRepo.editarResponsaveis(trato, tx);
    });
  };

  public async inserirInsumos(dto: InserirInsumosTratoDTO, idUsuarioSessao: number): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, tx);
      const idTrato = trato.id!;

      const insumosTrato = await this.tratoCulturalRepo.buscarInsumosDoTrato(idTrato, tx);

      const mapaExistentes = new Map<number, number>(
        insumosTrato.map(item => [item.idInsumo_PFK, Number(item.qtdUsada)])
      );

      const novosInsumosParaInserir: DadosInsercao[] = [];
      const insumosParaAtualizar: DadosAtualizacao[] = [];

      for (const item of dto.insumos) {
        const resultado = await this.processarItemInsumo(
          item, idTrato, trato.safra.idPropriedade, idUsuarioSessao, mapaExistentes, tx
        );

        if (resultado.acao === 'INSERIR') {
          novosInsumosParaInserir.push(resultado.dados);
        } else if (resultado.acao === 'ATUALIZAR') {
          insumosParaAtualizar.push(resultado.dados);
        }
      }

      await this.salvarAlteracoesNoBanco(idTrato, novosInsumosParaInserir, insumosParaAtualizar, tx);
    });
  }

  public async buscarPorId(dto: BuscarTratoPorIdDTO, idUsuarioSessao: number): Promise<ResponseTratoCulturalDTO> {
    return await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, this.prisma);
  };

  public async listarTodosPropriedade(
    dto: ListarTratoPorPropriedadeDTO,
    idUsuarioSessao: number
  ): Promise<ResponseListagemTratosDTO> {
    return await this.prisma.$transaction(async (tx) => {
      await this.validarAcessoPropriedade(dto.idPropriedade, idUsuarioSessao, tx);

      const { total, tratos } = await this.tratoCulturalRepo.listarTodosPropriedade(
        dto.idPropriedade,
        dto.pagina,
        dto.filtroInicio,
        dto.filtroFim,
        dto.status
      );
      return this.formatarRespostaPaginada(total, tratos, dto.pagina);
    });
  };

  public async listarTodosSafra(
    dto: ListarTratoPorSafraDTO,
    idUsuarioSessao: number
  ): Promise<ResponseListagemTratosDTO> {
    return await this.prisma.$transaction(async (tx) => {
      await this.validarAcessoPropriedade(dto.idPropriedade, idUsuarioSessao, tx);

      const { total, tratos } = await this.tratoCulturalRepo.listarTodosSafra(
        dto.idSafra,
        dto.idPropriedade,
        dto.pagina
      );
      return this.formatarRespostaPaginada(total, tratos, dto.pagina);
    });
  };

  public async listarTodosTalhao(
    dto: ListarTratoPorTalhaoDTO,
    idUsuarioSessao: number
  ): Promise<ResponseListagemTratosDTO> {
    return await this.prisma.$transaction(async (tx) => {
      await this.validarAcessoPropriedade(dto.idPropriedade, idUsuarioSessao, tx);

      const { total, tratos } = await this.tratoCulturalRepo.listarTodosTalhao(
        dto.idTalhao,
        dto.idPropriedade,
        dto.pagina,
        dto.status
      );
      return this.formatarRespostaPaginada(total, tratos, dto.pagina);
    });
  };

  public async buscarTiposTratos(): Promise<TipoTratoDTO[]> {
    return await this.tratoCulturalRepo.buscarTiposTratos();
  };

  public async buscarTipoTratoPorDescricao(descricao: string, tx: Prisma.TransactionClient = this.prisma): Promise<TipoTratoDTO> {
    return await this.tratoCulturalRepo.buscarTipoTratoPorDescricao(descricao, tx);
  };

  public async alterarInicioTrato(dto: AlterarInicioTratoCulturalDTO, idUsuarioSessao: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, tx);
      trato.editarInicio(dto.dataInicio);
      await this.tratoCulturalRepo.alterarInicioTrato(trato, tx);
    });
  };

  public async finalizarTrato(dto: FinalizarTratoCulturalDTO, idUsuarioSessao: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, tx);
      trato.finalizar(dto.dataInicio, dto.dataFim);
      await this.tratoCulturalRepo.finalizarTrato(trato, tx);
    });
  };

  public async excluirTransacoes(dto: ExcluirTransacoesTratoDTO, idUsuarioSessao: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, tx);
      trato.excluirTransacoes(dto.idTransacoes);
      await this.tratoCulturalRepo.excluirTransacoes(trato, tx);
    });
  };

  public async excluirInsumos(dto: ExcluirInsumosTratoDTO, idUsuarioSessao: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, tx);
      trato.excluirInsumos(dto.idInsumos);
      const insumosTrato = await this.tratoCulturalRepo.buscarInsumosDoTrato(dto.idTrato, tx);
      if (insumosTrato && insumosTrato.length > 0) {
        await Promise.all(
          insumosTrato.map(async (insumo) => {
            if (dto.idInsumos.includes(insumo.idInsumo_PFK!)) {
              let estoque = await this.estoqueRepo.buscarEstoque(insumo.idInsumo_PFK, trato.safra.idPropriedade, idUsuarioSessao, tx);
              if (estoque) {
                estoque.adicionar(insumo.qtdUsada);
                await this.estoqueRepo.atualizar(estoque, tx);
              };
            };
          })
        );
      };
      await this.tratoCulturalRepo.excluirInsumos(trato, tx);
    });
  };

  public async excluir(dto: ExcluirTratoCulturalDTO, idUsuarioSessao: number, tx?: Prisma.TransactionClient): Promise<void> {
    const executarOperacao = async (tx: Prisma.TransactionClient) => {
      const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao, tx);
      const safras = await this.safraRepo.buscarSafrasPorPropriedade(trato.safra.idPropriedade, tx);
      if (trato.safra.dataFim !== null) {
        throw new Error("SAFRA_ENCERRADA");
      };
      const insumosTrato = await this.tratoCulturalRepo.buscarInsumosDoTrato(dto.idTrato, tx);
      if (insumosTrato && insumosTrato.length > 0) {
        await Promise.all(
          insumosTrato.map(async (insumo) => {
            let estoque = await this.estoqueRepo.buscarEstoque(insumo.idInsumo_PFK, trato.safra.idPropriedade, idUsuarioSessao, tx);
            if (estoque) {
              estoque.adicionar(insumo.qtdUsada);
              await this.estoqueRepo.atualizar(estoque, tx);
            };
          })
        );
      };
      await this.tratoCulturalRepo.excluir(trato, tx);
    };
    if (tx) {
      await executarOperacao(tx);
    } else {
      await this.prisma.$transaction(async (tx) => {
        await executarOperacao(tx);
      });
    };
  };

  private formatarRespostaPaginada(
    total: number,
    tratos: ResponseTratoCulturalDTO[],
    pagina?: number
  ): ResponseListagemTratosDTO {
    const limite = 25;
    const response: ResponseListagemTratosDTO = { total, tratos: tratos };
    if (pagina) {
      const totalPaginas = Math.ceil(total / limite);
      response.totalPaginas = totalPaginas === 0 ? 1 : totalPaginas;
      response.paginaAtual = pagina;
    };
    if (tratos.length === 0) {
      throw new Error("TRATOS_NAO_ENCONTRADOS");
    };
    return response;
  };
}

export default TratoCulturalService;