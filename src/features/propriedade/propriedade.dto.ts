import Endereco from "../../shared/domain/endereco/endereco.vo";
import Tamanho  from "../../shared/domain/tamanho/tamanho.entity";

export type CreatePropriedadeDTO = {
  nome: string;
  tamanho: Tamanho;
  endereco: Endereco;
};

export type PropriedadeResponseDTO = {
  id: number | undefined;
  nome: string;
  tamanho: Tamanho;
  endereco: Endereco;
};

export type UpdateNomePropriedadeDTO = {
  nome: string;
}

export type UpdateTamanhoPropriedadeDTO = {
  tamanho: Tamanho;
}

export type UpdateEnderecoPropriedadeDTO = {
  endereco: Endereco;
}

export type ListPropriedadesDTO = {
  idProprietario: number;
};

export type ExcluirPropriedadeDTO = {
  id: number;
};