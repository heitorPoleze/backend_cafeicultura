import { type } from "os";
import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import Pessoa from "../../shared/domain/pessoa/pessoa.interface";
import PessoaBase from "../../shared/domain/pessoa/pessoabase.entity";
import { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";
import Despesa from "../despesa/despesa.entity";
import { TipoTrato } from "../tratocultural/tratocultural.entity";
import Safra from "./safra.entity";
import { TransacaoRelatorioWrapperDTO } from "../transacaofinanceira/transacaofinanceira.dto";

export type CadastrarSafraDTO = {
  idPropriedade: number;
  dataInicio: Date | string;
};

export type SafraRespostaDTO = {
  id: number;
  idPropriedade: number;
  dataInicio: Date;
  dataFim?: Date | null;
};

export type FinalizarSafraDTO = {
  id: number;
  dataFim: Date | string;
};

export type ExcluirSafraDTO = {
  id: number;
};
export type ReativarSafraDTO = {
  id: number;
  idPropriedade: number;
  dataInicio: Date;
  dataFim: null;
  }

export type ObterCustoSafraDTO ={
  idPropriedade: number;
  idSafra: number;
}

export type CustoSafraDTO ={
  custoTotal: number;
}
  
// ----- Relatórios -----
export type BuscarTodosEventosDTO = {
  idPropriedade: number;
  idSafra: number;
}

export type BuscarRelatorioFinanceiroSafraDTO = {
  idSafra: number;
  idPropriedade: number;
}

export type BuscarTodosEventosTalhaoDTO = {
  idSafra: number;
  idPropriedade: number;
  idTalhao: number;
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


export type RelatorioFinanceiroSafraDTO = {
  custoTotal: number;
  transacoes: TransacaoRelatorioWrapperDTO[];
  // receitaTotal: number; // For future implementation
  // saldo: number;        // For future implementation
}