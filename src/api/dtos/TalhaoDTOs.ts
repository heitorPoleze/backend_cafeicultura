export interface TalhaoCompletoDTO {
    nome: string;
    qtd_pes_cafe: number;
    tipo_cafe: "Arábica" | "Conilon";
    data_inicio_talhao: Date;
    data_fim_talhao: Date | null;
    variedades_cafe: string[];
    tamanho: {
        area: number;
        unidade_medida: "ha" | "m²";
    };
    propriedade: {
        nome: string;
        id?: number;
        endereco: {
            CEP: string;
            pais: string;
            UF: string;
            cidade: string;
            bairro: string;
            logradouro: string
        };
        tamanho: {
            area: number;
            unidade_medida: "ha" | "m²";
        };
        proprietario: {
            nome: string;
            cpf: string;
        };
    };
}

export interface CriarTalhaoDTO {
    nome: string;
    qtd_pes_cafe: number;
    tipo_cafe: "Arábica" | "Conilon";
    data_inicio_talhao: string;
    variedades_cafe: string[];
    tamanho: {
        area: number;
        unidade_medida: "ha" | "m²";
    };
    id_propriedade: number;
}