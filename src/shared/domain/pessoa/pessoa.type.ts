import Endereco from "../endereco/endereco.vo";

type Pessoa = {
  id?: number;
  idAdministrador: number | null;
  nome?: string;
  cpf?: string;
  razaoSocial?: string;
  cnpj?: string;
  inscrEstadual?: string | null;
  endereco: Endereco | null;
  dataCadastro: Date;
};

export default Pessoa;