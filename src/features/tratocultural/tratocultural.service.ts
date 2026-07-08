import TratoCultural, { TipoTrato } from "./tratocultural.entity";
import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import {
    BuscarTratoPorIdDTO,
  CadastrarTratoCulturalDTO,
  ConfirmarTratoCulturalDTO,
  FinalizarTratoCulturalDTO,
  ListarTratoPorPropriedadeDTO,
  ListarTratoPorSafraDTO,
  ListarTratoPorTalhaoDTO,
  ResponseTratoCulturalDTO,
  TipoTratoDTO,
} from "./tratocultural.dto";

import TratoCulturalRepository from "./tratocultural.repository";
import SafraRepository from "../safra/safra.repository";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import InsumoRepository from "../../shared/domain/insumo/insumo.repository";
import TalhaoRepository from "../talhao/talhao.repository";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";

class TratoCulturalService {
  constructor(
    private tratoCulturalRepo: TratoCulturalRepository,
    private propriedadeRepo: PropriedadeRepository,
    private safraRepo: SafraRepository,
    private insumoRepo: InsumoRepository,
    private talhaoRepo: TalhaoRepository,
    private pessoaRepo: PessoaRepository,
  ) {}

  public async cadastrar(
    dto: CadastrarTratoCulturalDTO,
    idUsuarioSessao: number,
  ): Promise<number> {
    const safra = await this.safraRepo.buscarPorId(dto.idSafra);
    if (!safra) throw new Error("SAFRA_NAO_ENCONTRADA");

    const propriedade = await this.propriedadeRepo.buscarPorId(
      safra.idPropriedade,
    );
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };

    if (safra.idPropriedade !== propriedade.id) {
      throw new Error("ACESSO_NEGADO");
    };

    const talhao = await this.talhaoRepo.buscarPorId(dto.idTalhao);
    if (!talhao) throw new Error("TALHAO_NAO_ENCONTRADO");

    if (talhao.idPropriedade !== propriedade.id) {
      throw new Error("ACESSO_NEGADO");
    };

    const tipoTratoValido = Object.values(TipoTrato).includes(dto.tipoTrato);
    if (!tipoTratoValido) throw new Error("TIPO_TRATO_INVALIDO");

    const responsaveisDomain: Pessoa[] = [];

    if (dto.responsaveisIds && dto.responsaveisIds.length > 0) {
      for (const idPessoa of dto.responsaveisIds) {
        const pessoa = await this.pessoaRepo.buscarPorId(idPessoa);
        if (!pessoa) throw new Error("RESPONSAVEL_NAO_ENCONTRADO");
        responsaveisDomain.push(pessoa);
      };
    };

    const novoTrato = new TratoCultural(
      undefined,
      dto.idTalhao,
      new Date(dto.dataInicio),
      dto.dataFim ? new Date(dto.dataFim) : null,
      dto.descricao,
      new Date(),
      safra,
      [],
      responsaveisDomain,
      false,
      dto.tipoTrato,
      [],
    );

    if (dto.insumosUtilizados && dto.insumosUtilizados.length > 0) {
      for (const insumoDto of dto.insumosUtilizados) {
        const insumoDomain = await this.insumoRepo.buscarPorId(
          insumoDto.idInsumo,
        );
        if (!insumoDomain) throw new Error("INSUMO_NAO_ENCONTRADO");

        const tratoInsumo = new TratoInsumo(insumoDomain, insumoDto.qtdUsada);
        novoTrato.insumosUtilizados!.push(tratoInsumo);
      };
    };

    const idGerado = await this.tratoCulturalRepo.cadastrar(
      novoTrato,
      dto.idTipoTrato,
    );
    return idGerado;
  };

  public async buscarPorId(
    dto: BuscarTratoPorIdDTO,
    idUsuarioSessao: number,
  ): Promise<ResponseTratoCulturalDTO> {
    const trato = await this.tratoCulturalRepo.buscarPorId(dto.idTrato);
    if (!trato) throw new Error("TRATO_NAO_ENCONTRADO");
    const propriedade = await this.propriedadeRepo.buscarPorId(
      trato.safra.idPropriedade,
    );
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };
    return trato;
  };

  public async listarTodosPropriedade(dto: ListarTratoPorPropriedadeDTO, idUsuarioSessao: number): Promise<ResponseTratoCulturalDTO[]> {
    const tratos = await this.tratoCulturalRepo.listarTodosPropriedade(dto.idPropriedade);
    if (!tratos || tratos.length === 0) throw new Error("TRATOS_NAO_ENCONTRADOS");

    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };
    

    return tratos;
  };

  public async listarTodosSafra(dto: ListarTratoPorSafraDTO, idUsuarioSessao: number): Promise<ResponseTratoCulturalDTO[]> {
    const tratos = await this.tratoCulturalRepo.listarTodosSafra(dto.idSafra, dto.idPropriedade);
    if (!tratos || tratos.length === 0) throw new Error("TRATOS_NAO_ENCONTRADOS");

    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };

    return tratos;
  };

  public async listarTodosTalhao(dto: ListarTratoPorTalhaoDTO, idUsuarioSessao: number): Promise<ResponseTratoCulturalDTO[]> {
    const tratos = await this.tratoCulturalRepo.listarTodosTalhao(dto.idTalhao,dto.idPropriedade);
    if (!tratos || tratos.length === 0) throw new Error("TRATOS_NAO_ENCONTRADOS");

    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };
    return tratos;
  }

  public async buscarTiposTratos(): Promise<TipoTratoDTO[]> {
    return await this.tratoCulturalRepo.buscarTiposTratos();
  };

  public async finalizarTrato(
    dto: FinalizarTratoCulturalDTO,
    idUsuarioSessao: number,
  ): Promise<void> {
    const trato = await this.tratoCulturalRepo.buscarPorId(dto.idTrato);
    if (!trato) throw new Error("TRATO_NAO_ENCONTRADO");

    const propriedade = await this.propriedadeRepo.buscarPorId(
      trato.safra.idPropriedade,
    );
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };
    trato.finalizar(dto.dataFim);
    await this.tratoCulturalRepo.finalizarTrato(trato);
  };

  public async confirmarTrato(
    dto: ConfirmarTratoCulturalDTO,
    idUsuarioSessao: number,
  ): Promise<void> {
    const trato = await this.tratoCulturalRepo.buscarPorId(dto.idTrato);
    if (!trato) throw new Error("TRATO_NAO_ENCONTRADO");

    const propriedade = await this.propriedadeRepo.buscarPorId(
      trato.safra.idPropriedade,
    );
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };
    trato.confirmar();
    await this.tratoCulturalRepo.confirmarTrato(trato);
  };
}

export default TratoCulturalService;
