import { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";

export type CadastrarCompraInsumoDTO = {
  idInsumo: number;
  qtdComprada: number;
  
  idPropriedade: number;
  idEvento: number | null;
  beneficiado: number;
  valor: number;
  descricao: string;
  formaPagamento: FormaPagamento;
  tipoOperacao: TipoOperacao; 
}

export type ListarPorPropriedadeDTO = {
  idPropriedade: number;
}

export type ListarPorProprietarioDTO = {
  idProprietario: number;
}

export type ListarPorInsumoDescricaoDTO = {
  descricao: string;
}