import { RowDataPacket } from "mysql2/promise";

export type IUsuarioRow = RowDataPacket & {
  idUsuario_PFK: number;
  email: string;
  telefone: string;
};