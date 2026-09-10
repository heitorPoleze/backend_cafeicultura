import PessoaBase from "../../shared/domain/pessoa/pessoabase.entity";
import { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";

export type BuscarExtratoFinanceiroDTO = {
  idPropriedade: number;
  dataInicio?: Date;
  dataFim?: Date;
  pagina: number;
  limite: number;
}

export type ExtratoFinanceiroDTO = {
  totalRegistros: number;
  paginaAtual: number;
  totalPaginas: number;
  resumo: {
    totalDespesas: number;
    // totalReceitas: number; // TODO: Implementar quando o módulo de Receitas existir
    // lucroLiquido: number;  // TODO: Implementar quando o módulo de Receitas existir
  };
  transacoes: TransacaoRelatorioWrapperDTO[];
}

export type TransacaoFinanceiraDTO = {
  id: number | undefined;
  idEvento: number | null;
  idPropriedade: number;
  dataHora: Date | string;
  valor: number;
  formaPagamento: FormaPagamento;
  tipoOperacao: TipoOperacao;
}

export type DespesaDTO = TransacaoFinanceiraDTO & {
  beneficiado: PessoaBase;
  descricao: string;
};

export type TransacaoRelatorioWrapperDTO = {
  origem: 'EVENTO_CONFIRMADO' | 'DESPESA_GERAL';
  dados: DespesaDTO;
};