import { RowDataPacket } from "mysql2/promise";

export type IAuthRow = RowDataPacket & {
  idUsuario_PFK: number;
  entrada: string;
  senha: string;
};