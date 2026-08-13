import { PrismaClient } from "@prisma/client";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import TratoCulturalRepository from "../tratocultural/tratocultural.repository";
import { BuscarEventosPropriedadeDTO, EventoRelatorioDTO, TratoCulturalDTO } from "./evento.dto";
import { StatusTrato } from "../tratocultural/tratocultural.dto";

export class EventoService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly propriedadeRepo: PropriedadeRepository,
    private readonly tratoCulturalRepo: TratoCulturalRepository
  ) {}

  public async listarEventosPropriedade(
    dto: BuscarEventosPropriedadeDTO, 
    idUsuarioSessao: number
  ): Promise<EventoRelatorioDTO[]> {
    
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");
    
    return await this.prisma.$transaction(async (tx) => {
      const { tratos } = await this.tratoCulturalRepo.listarTodosPropriedade(
        dto.idPropriedade,
        undefined,
        undefined,
        dto.dataInicio,
        dto.dataFim,
        StatusTrato.TODOS,
        tx
      );

      const eventosRelatorio: EventoRelatorioDTO[] = tratos.map((trato) => ({
        modulo: 'TRATO_CULTURAL' as const,
        dados: trato
      }));

      eventosRelatorio.sort((a, b) => {
        const dateA = new Date(a.dados.dataInicio).getTime();
        const dateB = new Date(b.dados.dataInicio).getTime();
        return dateB - dateA;
      });
      
      if (!eventosRelatorio || eventosRelatorio.length === 0) {
        throw new Error("SEM_EVENTOS");
      }

      return eventosRelatorio;
    });
  }
}