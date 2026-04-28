import Formatador from "../../utilitarios/Formatador";

abstract class Pessoa {
  private _id: number | undefined;
  private _data_hora_cadastro: Date;

  constructor(id: number | undefined,) {
    this._data_hora_cadastro = new Date();

    if (id && id <= 0) 
      throw new Error("ID do produto deve ser maior que zero!");
    this._id = id;
  }

  public get data_hora_cadastro(): Date {
    return this._data_hora_cadastro;
  }

  public set data_hora_cadastro(novo_valor: Date) {
    this._data_hora_cadastro = novo_valor;
  }

  public get id(): number | undefined {
    return this._id;
  }

  public toJSON(filhos?: object) {
    return {
      id: this._id,
      data_hora_cadastro: this._data_hora_cadastro,
      ...filhos,
    };
  }

  public toString(): string {
    return (
      "Data e hora de cadastro: " +
      Formatador.dataFormatada(this._data_hora_cadastro, true)
    );
  }
}

export default Pessoa;