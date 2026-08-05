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
  ReativarSafraDTO,
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
  public async buscarTodasSafrasPorPropriedade(idPropriedade: number, idUsuarioSessao: number): Promise<SafraRespostaDTO[]> {
    const propriedade = await this.propriedadeRepo.buscarPorId(idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    }
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    }
    const safras = await this.safraRepository.buscarSafrasPorPropriedade(idPropriedade);
    return safras.map((safra) => safra.toJSON());
  }
 
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
public async reativarSafra(idSafra: number, idPropriedadeRequisicao?: number): Promise<SafraRespostaDTO> {
  const safraAlvo = await this.safraRepository.buscarPorId(idSafra);
  
  if (!safraAlvo) {
    throw new Error("NAO_ENCONTRADA");
  }

  if (idPropriedadeRequisicao && safraAlvo.idPropriedade !== idPropriedadeRequisicao) {
    throw new Error("ACESSO_NEGADO"); 
  }

  const safraReativada = await this.safraRepository.reativar(safraAlvo);
  
  if (!safraReativada || !safraReativada.id) {
    throw new Error("NAO_REATIVADA");
  }

  if (safraReativada.dataFim === null) {
    return {
      id: safraReativada.id,
      idPropriedade: safraReativada.idPropriedade,
      dataInicio: safraReativada.dataInicio,
      dataFim: safraReativada.dataFim
    };
  }

  throw new Error("NAO_REATIVADA");
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