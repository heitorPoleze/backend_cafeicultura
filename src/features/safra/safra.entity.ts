class Safra {
  private _id: number | undefined;
  private _idPropriedade: number;
  private _dataInicio: Date;
  private _dataFim?: Date | null;

  constructor(props: {
    id: number | undefined;
    idPropriedade: number;
    dataInicio: Date | string;
    dataFim?: Date | string | null;
  }) {
    this._id = props.id;
    this._idPropriedade = props.idPropriedade;

    if (props.dataInicio > new Date()) {
      throw new Error("DATA_INICIO_FUTURA");
    };
    this._dataInicio = new Date(props.dataInicio);

    if (props.dataFim && props.dataFim < this._dataInicio) {
      throw new Error("DATA_FIM_ANTERIOR");
    };
    if (props.dataFim && props.dataFim > new Date()) {
      throw new Error("DATA_FIM_SUPERIOR");
    };
    this._dataFim = props.dataFim ? new Date(props.dataFim) : null;
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

  public isAtiva(): boolean {
    return !this._dataFim 
  };

  public finalizar(dataFim: Date | string): void {
    const dataEncerramento = new Date(dataFim);
    const hoje = new Date();
    if (dataEncerramento > hoje) {
      throw new Error("DATA_FIM_SUPERIOR");
    };
    if (dataEncerramento < this._dataInicio) {
      throw new Error("DATA_FIM_ANTERIOR");
    };

    this._dataFim = dataEncerramento;
  };
  
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
