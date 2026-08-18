import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import Despesa from "../despesa/despesa.entity";
import Safra from "../safra/safra.entity";
import { TipoTrato } from "./tratocultural.entity";

export type TipoTratoDTO = {
  id: number;
  descricao: string;
};

export type InsumoUtilizadoDTO = {
  idInsumo: number;
  qtdUsada: number;
};

export type CadastrarTratoCulturalDTO = {
  idTalhao: number;
  idSafra: number;
  dataInicio: string;
  dataFim?: string;
  descricao: string;
  tipoTrato: TipoTrato;
  idTipoTrato: number;
  transacoesFinanceiras?: Despesa[];
  insumosUtilizados?: InsumoUtilizadoDTO[];
  responsaveisIds?: number[];
};

export type ResponseTratoCulturalDTO = {
  id: number | undefined;
  idTalhao: number;
  dataInicio: Date;
  dataFim: Date | null;
  descricao: string;
  dataCadastro: Date;
  safra: Safra;
  transacoesFinanceiras: Despesa[] | undefined;
  responsaveis: Pessoa[] | undefined;
  tipoTrato: TipoTrato;
  insumosUtilizados: TratoInsumo[] | undefined;
};

export type AtualizarDescricaoDTO = {
  idTrato: number;
  descricao: string;
};
export type AtualizarDescricaoTratoDTO  = {
  idTrato: number;
  descricao: string;
}

export type InserirInsumosTratoDTO = {
  idTrato: number;
  insumos: {
    idInsumo: number;
    qtdUsada: number;
  }[];
}

export type AlterarInicioTratoCulturalDTO = {
  idTrato: number;
  dataInicio: Date;
}

export type EditarResponsaveisTratoDTO = {
  idTrato: number;
  responsaveisIds: number[];
}

export type ExcluirInsumosTratoDTO = {
  idTrato: number;
  idInsumos: number[];
}

export type ExcluirTransacoesTratoDTO = {
  idTrato: number;
  idTransacoes: number[];
}

export type BuscarTratoPorIdDTO = { idTrato: number };

export type ExcluirTratoCulturalDTO = { idTrato: number };

export enum StatusTrato {
  AGENDADO = 'agendados',
  EM_ANDAMENTO = 'em_andamento',
  FINALIZADO = 'finalizados',
  TODOS = 'todos'
}

export type ListarTratoPorPropriedadeDTO = { 
  idPropriedade: number;
  filtroInicio?: Date;
  filtroFim?: Date;
  pagina?: number;
  status?: StatusTrato;
};

export type ListarTratoPorSafraDTO = {
  idSafra: number;
  idPropriedade: number;
  pagina?: number;
};

export type ListarTratoPorTalhaoDTO = {
  idTalhao: number;
  idPropriedade: number;
  pagina?: number;
  status?: StatusTrato;
};

export type FinalizarTratoCulturalDTO = {
  idTrato: number;
  dataInicio: Date;
  dataFim: Date;
};

export type ConfirmarTratoCulturalDTO = {
  idTrato: number;
};

export type ResponseListagemTratosDTO = {
  tratos: ResponseTratoCulturalDTO[]; 
  total: number;
  totalPaginas?: number;
  paginaAtual?: number;
};