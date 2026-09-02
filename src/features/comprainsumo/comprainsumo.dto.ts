import Insumo, { MedidaInsumo } from "../../shared/domain/insumo/insumo.entity";
import { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";
import Despesa from "../despesa/despesa.entity";

export type CadastrarCompraInsumoDTO = {
  idInsumo?: number;
  novoInsumo?: {
      descricao: string;
      medida: MedidaInsumo;
  };

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

export type CompraInsumoDTO = {
  id: number | undefined;
  insumo: Insumo;
  despesa: Despesa;
  qtdComprada: number;
}