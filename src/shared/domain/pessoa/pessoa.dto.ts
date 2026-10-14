import Endereco from "../endereco/endereco.vo";
export type TipoPapel = 
  | 'funcionario' 
  | 'cliente' 
  | 'meeiro' 
  | 'fornecedor' 
  | 'prestadordeservico';

type PessoaDTO = {
  id?: number;
  idAdministrador: number | null;
  nome?: string;
  cpf?: string | null;
  razaoSocial?: string;
  cnpj?: string | null;
  inscrEstadual?: string | null;
  endereco: Endereco | null;
  dataCadastro: Date;
  papel?: TipoPapel | null
};

export default PessoaDTO; 