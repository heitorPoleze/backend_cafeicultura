import { TransacaoRelatorioWrapperDTO } from "../transacaofinanceira/transacaofinanceira.dto";

export type CadastrarSafraDTO = {
  idPropriedade: number;
  dataInicio: Date;
};

export type SafraRespostaDTO = {
  id: number;
  idPropriedade: number;
  dataInicio: Date;
  dataFim?: Date | null;
};

export type FinalizarSafraDTO = {
  id: number;
  dataFim: Date;
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

export type RelatorioFinanceiroSafraDTO = {
  custoTotal: number;
  transacoes: TransacaoRelatorioWrapperDTO[];
  // receitaTotal: number; // For future implementation
  // saldo: number;        // For future implementation
}