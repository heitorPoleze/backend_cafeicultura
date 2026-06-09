import { EnderecoDTO } from "../../shared/domain/endereco/endereco.dto";
/**
 * DTO (Data Transfer Object) para a entidade Usuario.
 * Representa a estrutura de dados de um usuário para transferência,
 * omitindo informações sensíveis como a senha.
 */
export interface ReturnUsuarioDTO {
  idUsuario?: number;
  nomeCompleto: string;
  email: string;
  telefone: string;
  documento: string[];
  dataCadastro: Date;
  endereco?: EnderecoDTO;
  nomeExibicao: string; 
}
export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  tipoUser: "PF" | "PJ";
  telefone: string;
  senha: string;
  documento: string[];
  endereco?: EnderecoDTO;
}
