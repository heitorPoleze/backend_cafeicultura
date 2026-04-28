import { RowDataPacket } from "mysql2/promise";

export interface PropriedadeRow extends RowDataPacket {
    id: number;
    nome: string;
    proprietario_id: number;
    endereco_id: number;
    tamanho_id: number;
}

export interface PropriedadeCompletaRow extends PropriedadeRow {
    proprietario_nome: string;
    proprietario_cpf: string;
    endereco_cep: string;
    endereco_pais: string;
    endereco_uf: string;
    endereco_cidade: string;
    endereco_bairro: string;
    endereco_logradouro: string;
    tamanho_area: number;
    tamanho_unidade_medida: "m²" | "ha";
}