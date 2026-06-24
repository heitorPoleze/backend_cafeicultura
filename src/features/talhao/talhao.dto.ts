import { Especie } from './talhao.entity';


export type CadastrarTalhaoDTO = {
  nome: string;
  tamanho: {
    valor: number;
    medida: 'm2' | 'hectare';
  };
  idPropriedade: number;
  qtdPeCafe: number;
  especie: Especie;
  variedadesIds: number[];
  dataInicio: Date;
};

export type EncerrarTalhaoDTO = {
  id: number;
  dataFim: Date;
};

export type ExcluirTalhaoDTO = {
  id: number;
};