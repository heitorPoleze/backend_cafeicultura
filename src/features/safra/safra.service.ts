import Safra from "./safra.entity";
import SafraRepository from "./safra.repository";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import {
  CadastrarSafraDTO,
  SafraRespostaDTO,
  ExcluirSafraDTO,
  FinalizarSafraDTO,
  BuscarTodosEventosDTO,
  BuscarTodosEventosTalhaoDTO,
  DespesaDTO,
  TransacaoRelatorioWrapperDTO,
  BuscarRelatorioFinanceiroDTO,
  RelatorioFinanceiroSafraDTO,
  ReativarSafraDTO,
  ObterCustoSafraDTO,
  CustoSafraDTO,
  BuscarEventosPorModuloDTO,
} from "./safra.dto";

import { 
  EventoRelatorioDTO, 
  TratoCulturalDTO 
} from "../evento/evento.dto";
import { PrismaClient } from "@prisma/client";
import TratoCulturalRepository from "../tratocultural/tratocultural.repository";
import DespesaRepository from "../despesa/despesa.repository";

export class SafraService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly safraRepository: SafraRepository,
    private readonly propriedadeRepo: PropriedadeRepository,
    private readonly tratoCulturalRepo: TratoCulturalRepository,
    private readonly despesaRepo: DespesaRepository,
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

  public async gerarRelatorioFinanceiro(dto: BuscarRelatorioFinanceiroDTO, idUsuarioSessao: number): Promise<RelatorioFinanceiroSafraDTO> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const safra = await this.safraRepository.buscarPorId(dto.idSafra);
    if (!safra) throw new Error("NAO_ENCONTRADA");
    if (safra.idPropriedade !== dto.idPropriedade) throw new Error("SAFRA_NAO_PERTENCE_PROPRIEDADE");

    const limiteFim = safra.dataFim ? safra.dataFim : new Date();

    const relatorio = await this.prisma.$transaction(async (tx) => {
      
      const [despesasEventos, despesasGerais] = await Promise.all([
        this.despesaRepo.listarDespesasEventosConfirmadosSafra(dto.idSafra, dto.idPropriedade, tx),
        this.despesaRepo.listarDespesasGeraisPorPeriodo(dto.idPropriedade, safra.dataInicio, limiteFim, tx)
      ]);

      const transacoesFormatadas: TransacaoRelatorioWrapperDTO[] = [];
      let custoTotal = 0;

      if (despesasEventos && despesasEventos.length > 0) {
        for (const despesa of despesasEventos) {
          custoTotal += despesa.valor;
          transacoesFormatadas.push({
            origem: 'EVENTO_CONFIRMADO',
            dados: despesa
          });
        }
      }

      if (despesasGerais && despesasGerais.length > 0) {
        for (const despesa of despesasGerais) {
          custoTotal += despesa.valor;
          transacoesFormatadas.push({
            origem: 'DESPESA_GERAL',
            dados: despesa
          });
        }
      }

      transacoesFormatadas.sort((a, b) => {
        const dateA = new Date(a.dados.dataHora).getTime();
        const dateB = new Date(b.dados.dataHora).getTime();
        return dateB - dateA;
      });

      return {
        custoTotal,
        transacoes: transacoesFormatadas
      };
    });

    if (!relatorio || !relatorio.transacoes || relatorio.transacoes.length === 0) throw new Error("SEM_TRANSACOES");

    return relatorio;
  }

  public async obterCustoSafra(dto: ObterCustoSafraDTO, idUsuarioSessao: number): Promise<CustoSafraDTO> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const safra = await this.safraRepository.buscarPorId(dto.idSafra);
    if (!safra) throw new Error("NAO_ENCONTRADA");
    if (safra.idPropriedade !== dto.idPropriedade) throw new Error("SAFRA_NAO_PERTENCE_PROPRIEDADE");

    const limiteFim = safra.dataFim ? safra.dataFim : new Date();

    const relatorio = await this.prisma.$transaction(async (tx) => {
      
      const [despesasEventos, despesasGerais] = await Promise.all([
        this.despesaRepo.listarDespesasEventosConfirmadosSafra(dto.idSafra, dto.idPropriedade, tx),
        this.despesaRepo.listarDespesasGeraisPorPeriodo(dto.idPropriedade, safra.dataInicio, limiteFim, tx)
      ]);

      let custoTotal = 0;

      if (despesasEventos && despesasEventos.length > 0) {
        for (const despesa of despesasEventos) {
          custoTotal += despesa.valor;
        }
      }

      if (despesasGerais && despesasGerais.length > 0) {
        for (const despesa of despesasGerais) {
          custoTotal += despesa.valor;
        }
      }
      return {
        custoTotal
      };
    });

    if (!relatorio) throw new Error("SEM_TRANSACOES");

    return relatorio;
  }

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