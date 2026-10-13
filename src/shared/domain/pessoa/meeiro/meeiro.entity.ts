import IPessoa from "../pessoa.interface";
import PessoaBase from "../pessoabase.entity";

class Meeiro implements IPessoa {
  private _pessoa: PessoaBase;
  constructor(pessoa: PessoaBase) {
    this._pessoa = pessoa;
  };

  get pessoa(): PessoaBase {
    return this._pessoa;
  };

  public toJSON() {
    return this._pessoa.toJSON();
  };
};

export default Meeiro;