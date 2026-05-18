import Formatador from "../utils/Formatador";

abstract class Pessoa {
  private _dataCadastro: Date;

  constructor(dataCadastro?: Date) {
    // Se vier do banco, usa a data do banco. Se for novo cadastro, pega a data atual.
    this._dataCadastro = dataCadastro || new Date();
  };

  public get dataCadastro(): Date {
    return this._dataCadastro;
  };

  // Métodos Abstratos: Obrigam as classes filhas a saberem se apresentar
  // sem que a classe pai precise saber o que é CPF ou CNPJ.
  public abstract get documento(): string;
  public abstract get nomeExibicao(): string;

  public toJSON(filhos?: object) {
    return {
      dataCadastro: this._dataCadastro,
      ...filhos,
    };
  };

  public toString(): string {
    return "Data e hora de cadastro: " + Formatador.dataFormatada(this._dataCadastro, true);
  };
}

export default Pessoa;