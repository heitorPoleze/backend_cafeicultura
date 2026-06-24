export type CadastrarSafraDTO = {
  idPropriedade: number;
  dataInicio: Date | string;
};

export type SafraRespostaDTO = {
  id: number;
  idPropriedade: number;
  dataInicio: Date;
  dataFim?: Date | null;
};

export type FinalizarSafraDTO = {
  id: number;
  dataFim: Date | string;
};

export type ExcluirSafraDTO = {
  id: number;
};