import { MedidaInsumo } from '../../shared/domain/insumo/insumo.entity';

export type CadastrarInsumoDTO = {
    descricao: string;
    medida: MedidaInsumo;
};

export type BuscarInsumoPorIdDTO = {
    id: number;
};

export type BuscarInsumoPorDescricaoDTO = {
    descricao: string;
};

export type InsumoResponseDTO = {
    id: number | undefined;
    idProprietario: number;
    descricao: string;
    medida: string;
};