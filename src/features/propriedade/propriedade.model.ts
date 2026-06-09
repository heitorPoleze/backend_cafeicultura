import { RowDataPacket } from "mysql2/promise";

export type IPropriedadeRow = RowDataPacket & {
  idPropriedade_PK: number;
  idProprietario_FK: number;
  nome: string; 
  // Tamanho
  idTamanho_PK: number;
  valor: number;
  medida: "hectare" | "m2";
  // Endereco
  idEndereco_PK: number;
  cidade: string;
  CEP: string;
  UF: string;
  pais: string;
  bairro: string;
  logradouro: string;
}