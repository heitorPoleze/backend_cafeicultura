export enum TipoEvento {
  TRATOS_CULTURAIS = 'tratosculturais',
  COLHEITAS = 'colheitas',
  FERMENTACOES = 'fermentacoes',
  PRE_SECAGENS = 'presecagens',
  SECAGENS = 'secagens',
  PILAGENS = 'pilagens',
  ARMAZENAGENS = 'armazenagens',
  VENDAS = 'vendas'
};

export enum TipoNotificacao {
  FUTURO_UM = 'FUTURO_UM',
  FUTURO_DOIS = 'FUTURO_DOIS',
  FUTURO_TRES = 'FUTURO_TRES',
  FUTURO_SETE= 'FUTURO_SETE',
  PASSADO = 'PASSADO'
};

export type ListarPorProprietarioDTO = {
  idProprietario: number;
};

export type ListarPorPropriedadeDTO = {
  idProprietario: number;
  idPropriedade: number;
};

export type MarcarComoLidaDTO = {
  idNotificacao: number;
  idProprietario: number;
};

export type NotificacaoResponseDTO = {
  id: number | undefined;
  idEvento: number;
  idProprietario: number;
  idPropriedade: number;
  tipoEvento: TipoEvento;
  tipoNotificacao: TipoNotificacao;
  dataCriacao: Date;
  lida: boolean;
};