import { Especie } from './talhao.entity';

export type ITalhaoModel = {
  idTalhao_PK?: number;
  nome: string;
  idPropriedade_FK: number;
  idTamanho_FK: number;
  qtdPeCafe: number;
  especie: Especie | string;
  dataInicio: Date;
  dataFim: Date | null;
  arquivado: boolean;
};

export type ITamanhoModel = {
  idTamanho_PK?: number;
  valor: number;
  medida: 'm2' | 'hectare';
};

export type IVariedadeModel = {
  idVariedade_PK: number;
  descricao: string;
};

export type ITalhaoCompletoModel = ITalhaoModel & {
  tamanhos: ITamanhoModel;
  variedadestalhoes: {
    variedades: IVariedadeModel;
  }[];
};