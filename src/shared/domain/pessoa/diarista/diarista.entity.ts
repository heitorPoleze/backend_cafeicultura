import IPessoa from "../pessoa.interface";
import PessoaBase from "../pessoabase.entity";

class Diarista implements IPessoa {
  private _pessoa: PessoaBase;
  private _valorHora: number;

  constructor(pessoa: PessoaBase, valorHora: number = 0.0) {
    this._pessoa = pessoa;
    this._valorHora = valorHora ?? 0.0;
  }

  get pessoa(): PessoaBase {
    return this._pessoa;
  }

  get valorHora(): number {
    return this._valorHora;
  }

  set valorHora(valorHora: number) {
    if (valorHora < 0) {
      throw new Error("VALOR_HORA_INVALIDO");
    }
    this._valorHora = valorHora;
  }

  public toJSON() {
    return this._pessoa.toJSON({
      valorHora: this._valorHora,
    });
  }
}

export default Diarista;