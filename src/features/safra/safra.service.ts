import Safra from "./safra.entity";
import SafraRepository from "./safra.repository";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import {
  CadastrarSafraDTO,
  SafraRespostaDTO,
  ExcluirSafraDTO,
  FinalizarSafraDTO,
  BuscarTodosEventosDTO,
  EventoRelatorioDTO,
  TratoCulturalDTO,
  BuscarTodosEventosTalhaoDTO,
  BuscarEventosPorModuloDTO,
} from "./safra.dto";
import { PrismaClient } from "@prisma/client";
import TratoCulturalRepository from "../tratocultural/tratocultural.repository";

export class SafraService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly safraRepository: SafraRepository,
    private readonly propriedadeRepo: PropriedadeRepository,
    private readonly tratoCulturalRepo: TratoCulturalRepository,
  ) { }

  public async cadastrar(dto: CadastrarSafraDTO, idUsuarioSessao: number): Promise<number> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    };
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };

    const totalAtivas = await this.safraRepository.contarSafrasAtivas(
      dto.idPropriedade,
    );
    if (totalAtivas >= 2) {
      throw new Error("DUAS_ATIVAS");
    };

    const novaSafra = new Safra({
      id: undefined,
      idPropriedade: dto.idPropriedade,
      dataInicio: dto.dataInicio,
    });

    return await this.safraRepository.cadastrar(novaSafra);
  };
  public async buscarAtivasPorPropriedade(idPropriedade: number, idUsuarioSessao: number): Promise<SafraRespostaDTO[]> {
    const propriedade = await this.propriedadeRepo.buscarPorId(idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    }
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    }
    const safras = await this.safraRepository.bucarAtivasPorPropriedade(idPropriedade);
    return safras.map((safra) => safra.toJSON());
  }
  public async buscarPorId(id: number, idUsuarioSessao: number): Promise<SafraRespostaDTO> {
    const safra = await this.safraRepository.buscarPorId(id);
    if (!safra) {
      throw new Error("NAO_ENCONTRADA");
    };
    const propriedade = await this.propriedadeRepo.buscarPorId(safra.idPropriedade);
    if (!propriedade) {
      throw new Error('PROPRIEDADE_NAO_ENCONTRADA');
    };
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };
    return safra.toJSON();
  };

  public async finalizar(dto: FinalizarSafraDTO, idUsuarioSessao: number): Promise<void> {
    const safra = await this.safraRepository.buscarPorId(dto.id);
    if (!safra) {
      throw new Error("NAO_ENCONTRADA");
    };
    const propriedade = await this.propriedadeRepo.buscarPorId(safra.idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    };
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };
    safra.finalizar(dto.dataFim);
    await this.safraRepository.finalizar(safra);
  }

  public async excluir(dto: ExcluirSafraDTO, idUsuarioSessao: number): Promise<void> {
    const safra = await this.safraRepository.buscarPorId(dto.id);
    if (!safra) {
      throw new Error("NAO_ENCONTRADA");
    };
    const propriedade = await this.propriedadeRepo.buscarPorId(safra.idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    };
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };
    await this.safraRepository.excluir(safra);
  };

  // ---- Relatórios -----
  public async listarTodosEventos(dto: BuscarTodosEventosDTO, idUsuarioSessao: number): Promise<EventoRelatorioDTO[]> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const safra = await this.safraRepository.buscarPorId(dto.idSafra);
    if (!safra) throw new Error("NAO_ENCONTRADA");
    if (safra.idPropriedade !== dto.idPropriedade) throw new Error("SAFRA_NAO_PERTENCE_PROPRIEDADE");

    const eventos = await this.prisma.$transaction(async (tx) => {
      const [tratosCulturais] = await Promise.all([
        this.tratoCulturalRepo.listarTodosSafra(dto.idSafra, dto.idPropriedade, tx),
        // this.colheitaRepo.listarTodosSafra(dto.idSafra, dto.idPropriedade, tx) 
      ]);

      const eventosRelatorio: EventoRelatorioDTO[] = [
        ...tratosCulturais.map((trato) => ({
          modulo: 'TRATO_CULTURAL' as const,
          dados: trato.toJSON() as TratoCulturalDTO
        })),
      ];

      eventosRelatorio.sort((a, b) => {
        const dateA = new Date(a.dados.dataInicio).getTime();
        const dateB = new Date(b.dados.dataInicio).getTime();
        return dateB - dateA;
      });

      return eventosRelatorio;
    });
    if (!eventos || eventos.length === 0) throw new Error("SEM_EVENTOS");

    return eventos;
  }


  public async listarEventosPorModulo(dto: BuscarEventosPorModuloDTO, idUsuarioSessao: number): Promise<EventoRelatorioDTO[]> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const safra = await this.safraRepository.buscarPorId(dto.idSafra);
    if (!safra) throw new Error("SAFRA_NAO_ENCONTRADA");
    if (safra.idPropriedade !== dto.idPropriedade) throw new Error("SAFRA_NAO_PERTENCE_PROPRIEDADE");

    return await this.prisma.$transaction(async (tx) => {
      let eventosRelatorio: EventoRelatorioDTO[] = [];

      const moduloSanitizado = dto.modulo.trim().toUpperCase();

      switch (moduloSanitizado) {
        case 'TRATO_CULTURAL': {
          console.log(dto)
          const tratos = await this.tratoCulturalRepo.listarTodosSafra(dto.idSafra, dto.idPropriedade, tx);
          eventosRelatorio = tratos.map((trato) => ({
            modulo: 'TRATO_CULTURAL' as const,
            dados: trato.toJSON() as TratoCulturalDTO
          }));
          break;
        }

        // FUTURE SCALABILITY POINT
        // case 'COLHEITA': {
        //   const colheitas = await this.colheitaRepo.listarTodosSafra(dto.idSafra, dto.idPropriedade, tx);
        //   eventosRelatorio = colheitas.map((colheita) => ({
        //     modulo: 'COLHEITA' as const,
        //     dados: colheita.toJSON() as unknown as ColheitaDTO
        //   }));
        //   break;
        // }

        default:
          throw new Error("MODULO_EVENTO_INVALIDO");
      }

      eventosRelatorio.sort((a, b) => {
        const dateA = new Date(a.dados.dataInicio).getTime();
        const dateB = new Date(b.dados.dataInicio).getTime();
        return dateB - dateA;
      });

      return eventosRelatorio;
    });
  }

  public async listarTodosEventosTalhao(dto: BuscarTodosEventosTalhaoDTO, idUsuarioSessao: number): Promise<EventoRelatorioDTO[]> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const safra = await this.safraRepository.buscarPorId(dto.idSafra);
    if (!safra) throw new Error("NAO_ENCONTRADA");

    const eventos = await this.prisma.$transaction(async (tx) => {

      const [tratosCulturais] = await Promise.all([
        this.tratoCulturalRepo.listarTodosTalhaoSafra(dto.idTalhao, dto.idSafra, dto.idPropriedade, tx),
      ]);

      const eventosRelatorio: EventoRelatorioDTO[] = [
        ...tratosCulturais.map((trato) => ({
          modulo: 'TRATO_CULTURAL' as const,
          dados: trato.toJSON() as TratoCulturalDTO
        })),
      ];

      eventosRelatorio.sort((a, b) => {
        const dateA = new Date(a.dados.dataInicio).getTime();
        const dateB = new Date(b.dados.dataInicio).getTime();
        return dateB - dateA;
      });

      return eventosRelatorio;
    });

    if (!eventos || eventos.length === 0) throw new Error("SEM_EVENTOS");

    return eventos;
  }
};

export default SafraService;