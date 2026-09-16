import Formatador from "../../shared/utils/Formatador";

class Safra {
  private _id: number | undefined;
  private _idPropriedade: number;
  private _dataInicio: Date;
  private _dataFim?: Date | null;

  constructor(
    id: number | undefined,
    idPropriedade: number,
    dataInicio: Date,
    dataFim?: Date | null,
  ) {
    this._id = id;
    this._idPropriedade = idPropriedade;

    if (dataInicio > new Date(Formatador.obterDataAtual())) {
      throw new Error("DATA_INICIO_FUTURA");
    };
    this._dataInicio = new Date(dataInicio);

    if (dataFim && dataFim < this._dataInicio) {
      throw new Error("DATA_FIM_ANTERIOR");
    };
    if (dataFim && dataFim > new Date(Formatador.obterDataAtual())) {
      throw new Error("DATA_FIM_SUPERIOR");
    };
    this._dataFim = dataFim ? new Date(dataFim) : null;
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

  public finalizar(dataFim: Date): void {
    if (dataFim > new Date(Formatador.obterDataAtual())) {
      throw new Error("DATA_FIM_SUPERIOR");
    };
    if (dataFim < this._dataInicio) {
      throw new Error("DATA_FIM_ANTERIOR");
    };

    this._dataFim = dataFim;
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
