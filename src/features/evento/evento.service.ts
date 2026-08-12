import { PrismaClient } from "@prisma/client";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import TratoCulturalRepository from "../tratocultural/tratocultural.repository";
import { BuscarEventosPropriedadeDTO, RelatorioEventosPaginadoDTO, EventoRelatorioDTO, TratoCulturalDTO } from "./evento.dto";

export class EventoService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly propriedadeRepo: PropriedadeRepository,
    private readonly tratoCulturalRepo: TratoCulturalRepository
  ) {}

  public async listarEventosPropriedade(
    dto: BuscarEventosPropriedadeDTO, 
    idUsuarioSessao: number
  ): Promise<RelatorioEventosPaginadoDTO> {
    
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const skip = (dto.pagina - 1) * dto.limite;
    
    return await this.prisma.$transaction(async (tx) => {
      const { total, tratos } = await this.tratoCulturalRepo.listarTodosPropriedade(
        dto.idPropriedade,
        skip,
        dto.limite,
        dto.dataInicio,
        dto.dataFim,
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
      const totalPaginas = Math.ceil(total / dto.limite);

      return {
        totalRegistros: total,
        paginaAtual: dto.pagina,
        totalPaginas: totalPaginas === 0 ? 1 : totalPaginas,
        eventos: eventosRelatorio
      };
    });
  }
}