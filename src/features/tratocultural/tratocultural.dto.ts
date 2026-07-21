import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import TransacaoFinanceira, { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";
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
  confirmado: boolean | undefined;
  tipoTrato: TipoTrato;
  insumosUtilizados: TratoInsumo[] | undefined;
};

export type AtualizarDescricaoDTO = {
  idTrato: number;
  descricao: string;
};

export type BuscarTratoPorIdDTO = { idTrato: number };

export type ListarTratoPorPropriedadeDTO = { idPropriedade: number };
export type ListarTratoPorSafraDTO = {
  idSafra: number;
  idPropriedade: number;
};

export type ListarTratoPorTalhaoDTO = { idTalhao: number, idPropriedade: number };

export type FinalizarTratoCulturalDTO = {
  idTrato: number;
  dataFim: Date;
};

export type ConfirmarTratoCulturalDTO = {
  idTrato: number;
};
