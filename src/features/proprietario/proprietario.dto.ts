import EnderecoDTO from "../../shared/domain/endereco/endereco.dto";
import Endereco from "../../shared/domain/endereco/endereco.vo";

export type CreateProprietarioDTO = {
  tipoPessoa: "fisica" | "juridica";
  idAdministrador: number | null;

  nome?: string;
  cpf?: string;

  razaoSocial?: string;
  cnpj?: string;
  inscrEstadual: string | null;

  email: string;
  telefone: string;
  senha: string;

  endereco: Endereco| null;
  dataCadastro: Date;
}

export interface ResponseProprietarioDTO {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  dataCadastro: Date;
  endereco?: EnderecoDTO;
}