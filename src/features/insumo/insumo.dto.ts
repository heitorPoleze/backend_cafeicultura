import { MedidaInsumo } from '../../shared/domain/insumo/insumo.entity';

export type CadastrarInsumoDTO = {
    descricao: string;
    medida: MedidaInsumo;
};

export type BuscarInsumoPorIdDTO = {
    id: number;
    idPropriedade: number;
};

export type BuscarInsumoPorDescricaoDTO = {
    descricao: string;
    idPropriedade: number;
};

export type BuscarTodosInsumosDTO = {
    idPropriedade: number;
};

export type InsumoResponseDTO = {
    id: number | undefined;
    descricao: string;
    medida: string;
    qtdEstoque: number;
};