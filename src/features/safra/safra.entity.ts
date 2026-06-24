class Safra {
  private _id: number | undefined;
  private _idPropriedade: number;
  private _dataInicio: Date;
  private _dataFim?: Date | null;
  private _arquivada: boolean;

  constructor(props: {
    id: number | undefined;
    idPropriedade: number;
    dataInicio: Date | string;
    dataFim?: Date | string | null;
    arquivada?: boolean;
  }) {
    this._id = props.id;
    this._idPropriedade = props.idPropriedade;
    this._dataInicio = new Date(props.dataInicio);
    this._dataFim = props.dataFim ? new Date(props.dataFim) : null;
    this._arquivada = props.arquivada ?? false;
  };

  get id() {
    return this._id;
  };
  get idPropriedade() {
    return this._idPropriedade;
  };
  get dataInicio() {
    return this._dataInicio;
  };
  get dataFim() {
    return this._dataFim;
  };
  get arquivada() {
    return this._arquivada;
  };

  public isAtiva(): boolean {
    return !this._dataFim && !this._arquivada;
  };

  public finalizar(dataFim: Date | string): void {
    const dataEncerramento = new Date(dataFim);
    const hoje = new Date();
    if (dataEncerramento > hoje) {
      throw new Error("A data de fim da safra não pode ser uma data futura.");
    };
    if (dataEncerramento < this._dataInicio) {
      throw new Error("A data de fim não pode ser anterior à data de início.");
    };

    this._dataFim = dataEncerramento;
  };

  public arquivar(): void {
    this._arquivada = true;
  };

  // Lógica para calcular o custo baseado nos eventos
  //   public calculaCusto(): number {
  //   }

  public toJSON() {
    return {
      id: this._id!,
      idPropriedade: this._idPropriedade,
      dataInicio: this._dataInicio,
      dataFim: this._dataFim
    };
  };
}

export default Safra;
