import { RowDataPacket } from "mysql2/promise";

export interface ProprietarioRow extends RowDataPacket {
    id: number;
    nome: string;
    cpf: string;
    pessoa_id: number;
}