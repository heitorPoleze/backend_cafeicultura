import TalhaoRepository from './talhao.repository';
import PropriedadeRepository from '../propriedade/propriedade.repository'; 
import { CadastrarTalhaoDTO, EncerrarTalhaoDTO, ExcluirTalhaoDTO, VariedadesDTO } from './talhao.dto';
import Talhao from './talhao.entity';
import Tamanho from '../../shared/domain/tamanho/tamanho.entity';

class TalhaoService {
  constructor(
    private readonly repository: TalhaoRepository,
    private readonly propriedadeRepo: PropriedadeRepository
  ) {}

  async cadastrarTalhao(dto: CadastrarTalhaoDTO, idUsuarioSessao: number): Promise<number> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    };

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };

    const talhoesExistentes = await this.repository.buscarAtivosPorPropriedade(dto.idPropriedade);

    const tamanhoNovoTalhao = new Tamanho(dto.tamanho.valor, dto.tamanho.medida);

    const limiteMaximoM2 = this.calcularAreaEmM2(propriedade.tamanho);
    const areaNovoTalhaoM2 = this.calcularAreaEmM2(tamanhoNovoTalhao);
    
    let areaUtilizadaM2 = 0;
    for (const t of talhoesExistentes) {
      areaUtilizadaM2 += this.calcularAreaEmM2(t.tamanho);
    };

    const areaDisponivelM2 = limiteMaximoM2 - areaUtilizadaM2;

    if (areaNovoTalhaoM2 > areaDisponivelM2) {
      const disponivelHectares = areaDisponivelM2 / 10000;
      const formatador = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4, minimumFractionDigits: 0 });
      throw new Error(
        `Capacidade excedida! A propriedade possui apenas ${formatador.format(Math.round(areaDisponivelM2))} m² ` +
        `(ou ${formatador.format(disponivelHectares)} hectares) disponíveis.`
      );
    };

    const novoTalhao = new Talhao(
      undefined,
      dto.nome,
      tamanhoNovoTalhao,
      dto.idPropriedade,
      dto.qtdPeCafe,
      dto.especie,
      [], // variedades serão associadas posteriormente no repository
      null, // Geolocalização nula por especificação
      new Date(dto.dataInicio), 
      null, // dataFim nula no cadastro
      false // arquivado falso por padrão
    );

    return await this.repository.cadastrar(novoTalhao, dto.variedadesIds);
  };

  public async buscarVariedades(): Promise<VariedadesDTO[]> {
    return await this.repository.buscarVariedades();
  };

  async encerrarTalhao(dto: EncerrarTalhaoDTO, idUsuarioSessao: number): Promise<void> {
    const talhao = await this.repository.buscarPorId(dto.id);
    if (!talhao) {
      throw new Error('NAO_ENCONTRADO');
    };

    const propriedade = await this.propriedadeRepo.buscarPorId(talhao.idPropriedade);
    if (!propriedade) {
      throw new Error('PROPRIEDADE_NAO_ENCONTRADA');
    };

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };

    talhao.encerrar(dto.dataFim);
    
    await this.repository.encerrar(talhao);
  };

  async excluir(dto: ExcluirTalhaoDTO, idUsuarioSessao: number): Promise<void> {
    const talhao = await this.repository.buscarPorId(dto.id);
    if (!talhao) {
      throw new Error('NAO_ENCONTRADO');
    };

    const propriedade = await this.propriedadeRepo.buscarPorId(talhao.idPropriedade);
    if (!propriedade) {
      throw new Error('PROPRIEDADE_NAO_ENCONTRADA');
    };

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };

    talhao.arquivar();

    await this.repository.excluir(talhao);
  };

  private calcularAreaEmM2(tamanho: Tamanho): number {
    if (tamanho.medida === "hectare") {
      return tamanho.valor * 10000;
    };
    return tamanho.valor;
  };
  public async buscarAtivosPorPropriedade(idPropriedade: number): Promise<Talhao[]> {
    return await this.repository.buscarAtivosPorPropriedade(idPropriedade);
  }
  public async buscarTodosPorPropriedade(idPropriedade: number): Promise<Talhao[]> {
    return await this.repository.buscarTodosPorPropriedade(idPropriedade);
  }
  public async buscarDesativadosPorPropriedade(idPropriedade: number): Promise<Talhao[]> {
    return await this.repository.buscarDesativadosPorPropriedade(idPropriedade);
  }
  public async buscarFinalizadosPorPropriedade(idPropriedade: number): Promise<Talhao[]> {
    return await this.repository.buscarFinalizadosPorPropriedade(idPropriedade);
  }
};

export default TalhaoService;