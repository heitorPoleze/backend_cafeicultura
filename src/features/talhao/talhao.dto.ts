import Talhao, { Especie } from './talhao.entity';


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
export type BuscarTalhoesDTO = {
  idPropriedade: number;
  pagina: number;
  limite: number;
};

export type ResponseBuscarTalhoesDTO = {
  talhoes: Talhao[];
  pagina?: number;
  total?: number;
  limite?: number;
};

export type EncerrarTalhaoDTO = {
  id: number;
  dataFim: Date;
};

export type ExcluirTalhaoDTO = {
  id: number;
};

export type VariedadesDTO = {
  id: number;
  descricao: string;
};