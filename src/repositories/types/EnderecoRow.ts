import { RowDataPacket } from "mysql2/promise";

export interface EnderecoRow extends RowDataPacket {
    id: number;
    cep: string;
    pais: string;
    uf: string;
    cidade: string;
    bairro: string;
    logradouro: string;
}