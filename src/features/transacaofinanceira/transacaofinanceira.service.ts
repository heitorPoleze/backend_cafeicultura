import { PrismaClient } from "@prisma/client";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import DespesaRepository from "../despesa/despesa.repository";
import { BuscarExtratoFinanceiroDTO, ExtratoFinanceiroDTO, TransacaoRelatorioWrapperDTO } from "./transacaofinanceira.dto";

class TransacaoFinanceiraService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly propriedadeRepo: PropriedadeRepository,
    private readonly despesaRepo: DespesaRepository
  ) {}

  public async gerarExtrato(
    dto: BuscarExtratoFinanceiroDTO, 
    idUsuarioSessao: number
  ): Promise<ExtratoFinanceiroDTO> {
    
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    return await this.prisma.$transaction(async (tx) => {
      
      const [despesasEventos, despesasGerais] = await Promise.all([
        this.despesaRepo.listarDespesasEventosConfirmados(dto.idPropriedade, dto.dataInicio, dto.dataFim, tx),
        this.despesaRepo.listarDespesasGerais(dto.idPropriedade, dto.dataInicio, dto.dataFim, tx)
      ]);
      let transacoesCombinadas: TransacaoRelatorioWrapperDTO[] = [];
      let totalDespesas = 0;

      if (despesasEventos && despesasEventos.length > 0) {
        for (const d of despesasEventos) {
            totalDespesas += d.valor;
            transacoesCombinadas.push({
                origem: 'EVENTO_CONFIRMADO',
                dados: d
            });
        }
      }

      if (despesasGerais && despesasGerais.length > 0) {
        for (const d of despesasGerais) {
            totalDespesas += d.valor;
            transacoesCombinadas.push({
                origem: 'DESPESA_GERAL',
                dados: d
            });
        }
      }

      transacoesCombinadas.sort((a, b) => {
        return new Date(b.dados.dataHora).getTime() - new Date(a.dados.dataHora).getTime();
      });

      const totalRegistros = transacoesCombinadas.length;
      const totalPaginas = Math.ceil(totalRegistros / dto.limite);
      
      const skip = (dto.pagina - 1) * dto.limite;
      const transacoesPaginadas = transacoesCombinadas.slice(skip, skip + dto.limite);

      return {
        totalRegistros,
        paginaAtual: dto.pagina,
        totalPaginas: totalPaginas === 0 ? 1 : totalPaginas,
        resumo: {
          totalDespesas,
          // totalReceitas: 0, // TODO: Future Implementation
          // lucroLiquido: 0   // TODO: Future Implementation
        },
        transacoes: transacoesPaginadas
      };
    });
  }
}

export default TransacaoFinanceiraService;