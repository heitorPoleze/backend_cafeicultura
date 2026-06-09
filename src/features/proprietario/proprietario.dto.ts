import { EnderecoDTO } from "../../shared/domain/endereco/endereco.dto";

/**
 * DTO para criação de um novo Proprietário.
 * Reflete os campos validados nas rotas e usados no Service.
 */
export interface CreateProprietarioDTO {
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
}

/**
 * DTO para atualização de Proprietário.
 * Campos opcionais para permitir atualização parcial.
 */
export interface UpdateProprietarioDTO {
  email?: string;
  telefone?: string;
  senha?: string;
  nome?: string;          // Para PF
  razaoSocial?: string;   // Para PJ
  inscrEstadual: string | null; // Para PJ
}

/**
 * DTO de retorno para a API.
 * Otimizado para o consumo do Frontend, sem dados sensíveis.
 */
export interface ReturnProprietarioDTO {
  id: number;
  nomeExibicao: string;
  tipoPessoa: "PF" | "PJ";
  email: string;
  telefone: string;
  documentos: string[];
  dataCadastro: Date;
  endereco?: EnderecoDTO;
}