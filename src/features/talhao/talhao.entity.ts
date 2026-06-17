import Tamanho from "../../shared/domain/tamanho/tamanho.entity";

export enum Especie {
  Conilon = "conilon",
  Arabica = "arabica",
}

// Tipo simplificado e ignorado por enquanto
type Geolocalizacao = null;

class Talhao {
  private readonly _id: number | undefined;
  private _nome: string;
  private _tamanho: Tamanho;
  private _idPropriedade: number;
  private _qtdPeCafe: number;
  private _especie: Especie;
  private _variedadesCafe: string[];
  private _geolocalizacao: Geolocalizacao = null;
  private _dataInicio: Date;
  private _dataFim: Date | null;
  private _arquivado: boolean;
  constructor(
    id: number | undefined,
    nome: string,
    tamanho: Tamanho,
    idPropriedade: number,
    qtdPeCafe: number,
    especie: Especie,
    variedadesCafe: string[],
    geolocalizacao: Geolocalizacao = null,
    dataInicio: Date,
    dataFim: Date | null = null,
    arquivado: boolean = false,
  ) {
    if (!nome || nome.trim() === "") {
      throw new Error("O nome do talhão é obrigatório.");
    };
    if (qtdPeCafe < 0) {
      throw new Error("A quantidade de pés de café não pode ser negativa.");
    };
    if (!variedadesCafe) {
      throw new Error("A variedade de café é obrigatória.");
    };
    if (!dataInicio) {
      throw new Error("A data de início do talhão é obrigatória.");
    };
    if (dataInicio > new Date()) {
      throw new Error("A data de início do talhão não pode ser no futuro.");
    };
    if (dataFim && dataFim < dataInicio) {
      throw new Error(
        "A data de fim do talhão não pode ser anterior à data de início.",
      );
    };
    if (dataFim && dataFim > new Date()) {
      throw new Error("A data de fim do talhão não pode ser no futuro.");
    };
    this._id = id;
    this._nome = nome;
    this._tamanho = tamanho;
    this._idPropriedade = idPropriedade;
    this._qtdPeCafe = qtdPeCafe;
    this._especie = especie;
    this._variedadesCafe = variedadesCafe;
    this._geolocalizacao = geolocalizacao;
    this._dataInicio = dataInicio;
    this._dataFim = dataFim;
    this._arquivado = arquivado;
  }

  public get id(): number | undefined {
    return this._id;
  };
  public get nome(): string {
    return this._nome;
  };
  public get tamanho(): Tamanho {
    return this._tamanho;
  };
  public get idPropriedade(): number {
    return this._idPropriedade;
  };
  public get qtdPeCafe(): number {
    return this._qtdPeCafe;
  };
  public get especie(): Especie {
    return this._especie;
  };
  public get variedadesCafe(): string[] {
    return this._variedadesCafe;
  };
  public get geolocalizacao(): Geolocalizacao {
    return this._geolocalizacao;
  };
  public get dataInicio(): Date {
    return this._dataInicio;
  };
  public get dataFim(): Date | null {
    return this._dataFim;
  };
  public get arquivado(): boolean {
    return this._arquivado;
  };

  public encerrarTalhao(dataFim: Date): void {
    if (dataFim < this._dataInicio) {
      throw new Error("A data de fim do talhão não pode ser anterior à data de início.");
    };
    if (dataFim > new Date()) {
      throw new Error("A data de fim do talhão não pode ser no futuro.");
    };
    this._dataFim = dataFim;
    this._arquivado = true;
  };

 public toJSON() {
    return {
      id: this._id,
      nome: this._nome,
      idPropriedade: this._idPropriedade,
      tamanho: this._tamanho.toJSON(),
      qtdPeCafe: this._qtdPeCafe,
      especie: this._especie,
      variedadesCafe: this._variedadesCafe,
      geolocalizacao: this._geolocalizacao,
      dataInicio: this._dataInicio,
      dataFim: this._dataFim,
      arquivado: this._arquivado,
    };
  };
}
export default Talhao;