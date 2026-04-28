import { RowDataPacket } from "mysql2/promise";

export interface TamanhoRow extends RowDataPacket {
    id: number;
    area: number;
    unidade_medida: string;
}