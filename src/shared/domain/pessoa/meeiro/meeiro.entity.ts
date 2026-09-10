import IPessoa from "../pessoa.interface";
import PessoaFisica from "../pessoafisica.entity";
import PessoaJuridica from "../pessoajuridica.entity";

class Meeiro implements IPessoa {
  private _pessoa: PessoaFisica | PessoaJuridica;
  constructor(pessoa: PessoaFisica | PessoaJuridica) {
    this._pessoa = pessoa;
  };

  get pessoa(): PessoaFisica | PessoaJuridica {
    return this._pessoa;
  };

  public toJSON() {
    return this._pessoa.toJSON();
  };
};

export default Meeiro;