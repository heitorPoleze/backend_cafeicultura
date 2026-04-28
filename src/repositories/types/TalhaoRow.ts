import { RowDataPacket } from "mysql2";

export interface TalhaoRow extends RowDataPacket {
    id: number;
    nome: string;
    propriedade_id: number;
    tamanho_id: number;
    qtd_pes_cafe: number;
    tipo_cafe: "Arábica" | "Conilon";
    data_inicio_talhao: Date;
    data_fim_talhao: Date | null;
}

export interface VariedadeRow extends RowDataPacket {
    id: number;
    nome: string;
}

export interface TalhaoVariedadeRow extends RowDataPacket {
    talhao_id: number;
    variedade_id: number;
}