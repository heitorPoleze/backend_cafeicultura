import Endereco from "../endereco/endereco.vo";

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
  papel?: string | null
};

export default PessoaDTO; 