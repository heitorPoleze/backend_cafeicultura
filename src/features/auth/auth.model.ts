import { RowDataPacket } from "mysql2/promise";

export type IAuthRow = RowDataPacket & {
  idUsuario_PFK: number;
  email: string;
  telefone: string;
  senha: string;
  nomeExibicao: string; // Vem do JOIN com PessoaFisica ou PessoaJuridica
}