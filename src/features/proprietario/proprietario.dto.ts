import EnderecoDTO from "../../shared/domain/endereco/endereco.dto";
import Endereco from "../../shared/domain/endereco/endereco.vo";

export type CreateProprietarioDTO = {
  tipoPessoa: "fisica" | "juridica";

  // Campos para Pessoa Física
  nome?: string;
  cpf?: string;

  // Campos para Pessoa Jurídica
  razaoSocial?: string;
  cnpj?: string;
  inscrEstadual: string | null;

  // Credenciais
  email: string;
  telefone: string;
  senha: string;

  // Endereço
  endereco: Endereco| null;
  // Data de cadastro
  dataCadastro: Date;
}

/**
 * DTO de retorno para a API.
 * Otimizado para o consumo do Frontend, sem dados sensíveis.
 */
export interface ResponseProprietarioDTO {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  dataCadastro: Date;
  endereco?: EnderecoDTO;
}