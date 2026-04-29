import { RowDataPacket } from "mysql2/promise";

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
    id?: number;
    nome: string;
}

export interface TalhaoVariedadeRow extends RowDataPacket {
    talhao_id: number;
    variedade_id: number;
    nome_variedade?: string;
}

export interface TalhaoCompletoRow extends RowDataPacket {
    id: number;
    nome: string;
    qtd_pes_cafe: number;
    tipo_cafe: "Arábica" | "Conilon";
    data_inicio_talhao: Date;
    data_fim_talhao: Date | null;
    tamanho_id: number;
    tamanho_area: number;
    tamanho_unidade_medida: "ha" | "m²";
    propriedade_id: number;
    propriedade_nome: string;
    propriedade_proprietario_id: number;
    propriedade_proprietario_nome: string;
    propriedade_proprietario_cpf: string;
    propriedade_endereco_id: number;
    propriedade_endereco_cep: string;
    propriedade_endereco_pais: string;
    propriedade_endereco_uf: string;
    propriedade_endereco_cidade: string;
    propriedade_endereco_bairro: string;
    propriedade_endereco_logradouro: string;
    propriedade_tamanho_id: number;
    propriedade_tamanho_area: number;
    propriedade_tamanho_unidade_medida: "ha" | "m²";
}