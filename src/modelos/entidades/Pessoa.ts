import Formatador from "../../utilitarios/Formatador";

abstract class Pessoa {
  private _id: number | undefined;
  private _dataCadastro: Date;

  constructor(id: number | undefined,) {
    this._dataCadastro = new Date();

    if (id && id <= 0) 
      throw new Error("ID do produto deve ser maior que zero!");
    this._id = id;
  }

  public get dataCadastro(): Date {
    return this._dataCadastro;
  }

  public set dataCadastro(novo_valor: Date) {
    this._dataCadastro = novo_valor;
  }

  public get id(): number | undefined {
    return this._id;
  }

  public toJSON(filhos?: object) {
    return {
      id: this._id,
      dataCadastro: this._dataCadastro,
      ...filhos,
    };
  }

  public toString(): string {
    return (
      "Data e hora de cadastro: " +
      Formatador.dataFormatada(this._dataCadastro, true)
    );
  }
}

export default Pessoa;