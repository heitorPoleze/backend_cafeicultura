import TalhaoRepository from './talhao.repository';
import PropriedadeRepository from '../propriedade/propriedade.repository';
import { BuscarTalhoesDTO, CadastrarTalhaoDTO, EncerrarTalhaoDTO, ExcluirTalhaoDTO, ResponseBuscarTalhoesDTO, VariedadesDTO } from './talhao.dto';
import Talhao from './talhao.entity';
import Tamanho from '../../shared/domain/tamanho/tamanho.entity';
import { PrismaClient } from '@prisma/client';
import Formatador from '../../shared/utils/Formatador';

class TalhaoService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly repository: TalhaoRepository,
    private readonly propriedadeRepo: PropriedadeRepository,
  ) { }

  async cadastrarTalhao(dto: CadastrarTalhaoDTO, idUsuarioSessao: number): Promise<number> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    };

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };

    return await this.prisma.$transaction(async (tx) => {

      const talhoesExistentes = await this.repository.buscarAbertosPorPropriedade(dto.idPropriedade, tx);
      
      const nomeDuplicado = talhoesExistentes.some((t) => {
        return Formatador.normalizarNome(t.nome) === Formatador.normalizarNome(dto.nome);
      });

      if (nomeDuplicado) {
        throw new Error('NOME_DUPLICADO');
      };

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
      );

      return await this.repository.cadastrar(novoTalhao, dto.variedadesIds, tx);
    });
  };
 
  public async buscarVariedades(): Promise<VariedadesDTO[]> {
    return await this.repository.buscarVariedades();
  };

  async encerrarTalhao(dto: EncerrarTalhaoDTO, idUsuarioSessao: number): Promise<void> {
    const talhao = await this.repository.buscarPorId(dto.id);
    if (!talhao) {
      throw new Error('NAO_ENCONTRADO');
    };
    const eventosPosteriores = await this.repository.buscarEventosPosterioresEncerramento(dto.id, dto.dataFim);
    if (eventosPosteriores.length > 0) {
      throw new Error('EXISTE_EVENTO_POSTERIOR_AO_ENCERRAMENTO');
    }
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
    await this.repository.excluir(talhao);
  };

  private calcularAreaEmM2(tamanho: Tamanho): number {
    if (tamanho.medida === "hectare") {
      return tamanho.valor * 10000;
    };
    return tamanho.valor;
  };

  public async buscarAbertosPorPropriedade(idPropriedade: number): Promise<ResponseBuscarTalhoesDTO> {
    const resultado = await this.repository.buscarAbertosPorPropriedade(idPropriedade);
    return {
      talhoes: resultado,
    }
  }

  public async buscarTodosPorPropriedade(idPropriedade: number, pagina: number, limite: number): Promise<ResponseBuscarTalhoesDTO> {
    const resultado = await this.repository.buscarTodosPorPropriedade(
      idPropriedade,
      pagina,
      limite
    );
    return {
      pagina: resultado.pagina,
      limite: resultado.limite,
      talhoes: resultado.dados,
    };
  }

  public async buscarFinalizadosPorPropriedade(idPropriedade: number, pagina: number, limite: number): Promise<ResponseBuscarTalhoesDTO> {
    const resultado = await this.repository.buscarFinalizadosPorPropriedade(idPropriedade, pagina, limite);
    return {
      pagina: resultado.pagina,
      limite: resultado.limite,
      talhoes: resultado.dados
    };
  }
};

export default TalhaoService;