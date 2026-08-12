import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import Pessoa from "../../shared/domain/pessoa/pessoa.interface";
import Despesa from "../despesa/despesa.entity";
import { TipoTrato } from "../tratocultural/tratocultural.entity";
import Safra from "../safra/safra.entity";

export type BuscarEventosPropriedadeDTO = {
  idPropriedade: number;
  dataInicio?: Date;
  dataFim?: Date;
  pagina: number;
  limite: number;
}


export type EventoDTO = {
  id: number | undefined;
  idTalhao: number;
  dataInicio: Date;
  dataFim: Date | null;
  descricao: string;
  dataCadastro: Date;
  safra: Safra;
  transacoesFinanceiras: Despesa[] | undefined;
  responsaveis: Pessoa[] | undefined;
  confirmado: boolean | undefined;
}

export type TratoCulturalDTO = EventoDTO & {
  tipoTrato: TipoTrato;
  insumosUtilizados: TratoInsumo[] | undefined;
}

export type EventoRelatorioDTO =
  | { modulo: 'TRATO_CULTURAL'; dados: TratoCulturalDTO }

export type RelatorioEventosPaginadoDTO = {
  totalRegistros: number;
  paginaAtual: number;
  totalPaginas: number;
  eventos: EventoRelatorioDTO[];
}