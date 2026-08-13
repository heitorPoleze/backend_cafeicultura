import TratoCultural, { TipoTrato } from "./tratocultural.entity";
import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import {
  AtualizarDescricaoDTO,
  BuscarTratoPorIdDTO,
  CadastrarTratoCulturalDTO,
  ConfirmarTratoCulturalDTO,
  EditarResponsaveisTratoDTO,
  ExcluirInsumosTratoDTO,
  ExcluirTransacoesTratoDTO,
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

class TratoCulturalService {
  constructor(
    private tratoCulturalRepo: TratoCulturalRepository,
    private propriedadeRepo: PropriedadeRepository,
    private safraRepo: SafraRepository,
    private insumoRepo: InsumoRepository,
    private talhaoRepo: TalhaoRepository,
    private pessoaRepo: PessoaRepository,
  ) {}
  
  private async validarAcessoPropriedade(idPropriedade: number, idUsuarioSessao: number): Promise<void> {
    const propriedade = await this.propriedadeRepo.buscarPorId(idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");
  }

  private async buscarEValidarTrato(idTrato: number, idUsuarioSessao: number): Promise<TratoCultural> {
    const trato = await this.tratoCulturalRepo.buscarPorId(idTrato);
    if (!trato) throw new Error("TRATO_NAO_ENCONTRADO");
    await this.validarAcessoPropriedade(trato.safra.idPropriedade, idUsuarioSessao);
    return trato;
  }

  public async cadastrar(
    dto: CadastrarTratoCulturalDTO,
    idUsuarioSessao: number,
  ): Promise<number> {
    const safra = await this.safraRepo.buscarPorId(dto.idSafra);
    if (!safra) throw new Error("SAFRA_NAO_ENCONTRADA");
    await this.validarAcessoPropriedade(safra.idPropriedade, idUsuarioSessao);

    const talhao = await this.talhaoRepo.buscarPorId(dto.idTalhao);
    if (!talhao) throw new Error("TALHAO_NAO_ENCONTRADO");
    if (talhao.idPropriedade !== safra.idPropriedade) throw new Error("ACESSO_NEGADO");

    if (!Object.values(TipoTrato).includes(dto.tipoTrato)) throw new Error("TIPO_TRATO_INVALIDO");

    const despesasDomain: Despesa[] = (dto.transacoesFinanceiras || []).map(
      (despesa) => new Despesa(
        undefined, null, despesa.idPropriedade, new Date(), despesa.valor,
        despesa.formaPagamento, despesa.tipoOperacao, despesa.beneficiado, despesa.descricao,
      )
    );

    const responsaveisDomain: Pessoa[] = dto.responsaveisIds && dto.responsaveisIds.length > 0 
      ? await Promise.all(dto.responsaveisIds.map(async (idPessoa) => {
          const pessoa = await this.pessoaRepo.buscarPorId(idPessoa);
          if (!pessoa) throw new Error("RESPONSAVEL_NAO_ENCONTRADO");
          return pessoa;
        }))
      : [];

    const insumosDomain: TratoInsumo[] = dto.insumosUtilizados && dto.insumosUtilizados.length > 0
      ? await Promise.all(dto.insumosUtilizados.map(async (insumoDto) => {
          const insumoDomain = await this.insumoRepo.buscarPorId(insumoDto.idInsumo, idUsuarioSessao);
          if (!insumoDomain) throw new Error("INSUMO_NAO_ENCONTRADO");
          return new TratoInsumo(insumoDomain, insumoDto.qtdUsada);
        }))
      : [];
    
    const novoTrato = new TratoCultural(
      undefined, dto.idTalhao, new Date(dto.dataInicio),
      dto.dataFim ? new Date(dto.dataFim) : null,
      dto.descricao || "", new Date(), safra, despesasDomain, responsaveisDomain, dto.tipoTrato, insumosDomain
    );

    return await this.tratoCulturalRepo.cadastrar(novoTrato, dto.idTipoTrato);
  }

  public async atualizarDescricao(dto: AtualizarDescricaoDTO, idUsuarioSessao: number): Promise<void> {
    const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao);
    trato.descricao = dto.descricao;
    await this.tratoCulturalRepo.atualizarDescricao(trato);
  }

  public async editarResponsaveis(dto: EditarResponsaveisTratoDTO, idUsuarioSessao: number): Promise<void> {   
    const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao);
    
    const responsaveis: Pessoa[] = await Promise.all(
      dto.responsaveisIds.map(async (item) => {
        const responsavelDomain = await this.pessoaRepo.buscarPorId(item);
        if (!responsavelDomain) throw new Error("PESSOA_NAO_ENCONTRADA");
        return responsavelDomain;
      })
    );

    trato.editarResponsaveis(responsaveis);
    await this.tratoCulturalRepo.editarResponsaveis(trato);
  }

  public async inserirInsumos(dto: InserirInsumosTratoDTO, idUsuarioSessao: number): Promise<void> {   
    const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao);
    
    const novosInsumos: TratoInsumo[] = await Promise.all(
      dto.insumos.map(async (item) => {
        const insumoDomain = await this.insumoRepo.buscarPorId(item.idInsumo, idUsuarioSessao);
        if (!insumoDomain) throw new Error("INSUMO_NAO_ENCONTRADO");
        return new TratoInsumo(insumoDomain, item.qtdUsada);
      })
    );

    trato.inserirInsumos(novosInsumos);
    await this.tratoCulturalRepo.inserirInsumos(trato);
  }

  public async buscarPorId(dto: BuscarTratoPorIdDTO, idUsuarioSessao: number): Promise<ResponseTratoCulturalDTO> {
    return await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao);
  }

  public async listarTodosPropriedade(
    dto: ListarTratoPorPropriedadeDTO, 
    idUsuarioSessao: number
  ): Promise<ResponseListagemTratosDTO> {
    
    await this.validarAcessoPropriedade(dto.idPropriedade, idUsuarioSessao);

    const limite = 25;
    let skip: number | undefined = undefined;
    let take: number | undefined = undefined;

    if (dto.pagina) {
      skip = (dto.pagina - 1) * limite;
      take = limite;
    }

    const { total, tratos } = await this.tratoCulturalRepo.listarTodosPropriedade(
      dto.idPropriedade,
      skip,
      take,
      dto.filtroInicio,
      dto.filtroFim,
      dto.status
    );

    const tratosMapeados = tratos.map(t => t.toJSON() as unknown as ResponseTratoCulturalDTO);

    const response: ResponseListagemTratosDTO = {
      total,
      tratos: tratosMapeados
    };

    if (dto.pagina) {
      const totalPaginas = Math.ceil(total / limite);
      response.totalPaginas = totalPaginas === 0 ? 1 : totalPaginas;
      response.paginaAtual = dto.pagina;
    }

    return response;
  }
  
  public async listarTodosSafra(dto: ListarTratoPorSafraDTO, idUsuarioSessao: number): Promise<ResponseTratoCulturalDTO[]> {
    await this.validarAcessoPropriedade(dto.idPropriedade, idUsuarioSessao);
    const tratos = await this.tratoCulturalRepo.listarTodosSafra(dto.idSafra, dto.idPropriedade);
    if (!tratos || tratos.length === 0) throw new Error("TRATOS_NAO_ENCONTRADOS");
    return tratos;
  }

  public async listarTodosTalhao(
    dto: ListarTratoPorTalhaoDTO,
    idUsuarioSessao: number
  ): Promise<ResponseListagemTratosDTO> {
    
    await this.validarAcessoPropriedade(dto.idPropriedade, idUsuarioSessao);

    const { total, tratos } = await this.tratoCulturalRepo.listarTodosTalhao(
      dto.idTalhao,
      dto.idPropriedade,
      dto.pagina
    );
    
    const limite = 25;
    const totalPaginas = Math.ceil(total / limite);

    return { 
      tratos: tratos, 
      total, 
      totalPaginas: totalPaginas === 0 ? 1 : totalPaginas,
      paginaAtual: dto.pagina
    };
  }

  public async buscarTiposTratos(): Promise<TipoTratoDTO[]> {
    return await this.tratoCulturalRepo.buscarTiposTratos();
  }

  public async finalizarTrato(dto: FinalizarTratoCulturalDTO, idUsuarioSessao: number): Promise<void> {
    const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao);
    trato.finalizar(dto.dataFim);
    await this.tratoCulturalRepo.finalizarTrato(trato);
  }

  public async excluirTransacoes(dto: ExcluirTransacoesTratoDTO, idUsuarioSessao: number): Promise<void> {
    const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao);
    trato.excluirTransacoes(dto.idTransacoes);
    await this.tratoCulturalRepo.excluirTransacoes(trato);
  }

  public async excluirInsumos(dto: ExcluirInsumosTratoDTO, idUsuarioSessao: number): Promise<void> {
    const trato = await this.buscarEValidarTrato(dto.idTrato, idUsuarioSessao);
    trato.excluirInsumos(dto.idInsumos);
    await this.tratoCulturalRepo.excluirInsumos(trato);
  }
}

export default TratoCulturalService;