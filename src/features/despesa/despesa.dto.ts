import PessoaBase from "../../shared/domain/pessoa/pessoabase.entity";
import { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";

export type CriarDespesaDTO  = {
    idEvento: number | null;
    idPropriedade: number;
    valor: number;
    formaPagamento: FormaPagamento;
    tipoOperacao: TipoOperacao;
    beneficiado: number;
    descricao: string;
};

export type RespostaDespesaDTO = {
    id: number | undefined;
    idEvento: number | null;
    idPropriedade: number;
    dataHora: Date;
    valor: number;
    formaPagamento: FormaPagamento;
    tipoOperacao: TipoOperacao;
    beneficiado: PessoaBase;
    descricao: string;
};

export type BuscarDespesaDTO = {
    id: number;
};

export type ListarDespesasProprietarioDTO = {
    idProprietario: number;
};

export type ListarDespesasPropriedadeDTO = {
    idPropriedade: number;
};

export type ExcluirDespesaDTO = {
    id: number;
};