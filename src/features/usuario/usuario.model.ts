import { RowDataPacket } from "mysql2/promise";

/**
 * Interface que define o formato das linhas retornadas pelo banco de dados para a entidade Usuario.
 * Utilizada no UsuarioRepository para tipar as consultas SQL que envolvem JOINS.
 */
export interface IUsuarioRow extends RowDataPacket {
  idUsuario_PFK: number;
  email: string;
  telefone: string;
  senha?: string;
  dataCadastro: Date;
  // Informações vindas do JOIN com a tabela de Pessoas e sub-tabelas (PF/PJ)
  nomeExibicao: string;
  // Campos de Endereço (geralmente via JOIN com a tabela de endereços)
  idEndereco?: number;
  cidade?: string;
  bairro?: string;
  cep?: string;
  uf?: string;
  pais?: string;
  logradouro?: string;
  // Representação textual dos documentos no banco (ex: string JSON ou concatenada)
  documentos?: string;
}