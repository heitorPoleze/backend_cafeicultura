import { RowDataPacket } from "mysql2/promise";

export type IConsultorRow = RowDataPacket & {
  idConsultor_PFK: number;
  dataCadastro: Date;
  nome: string;
  cpf: string;
  // Dados de Auth que vêm no JOIN para leitura
  email: string;
  telefone: string;
}