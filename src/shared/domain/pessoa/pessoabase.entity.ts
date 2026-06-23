import Endereco from '../endereco/endereco.vo';
import Pessoa from './pessoa.interface';

abstract class PessoaBase implements Pessoa {
  private _id: number | undefined;
  private _endereco: Endereco | null;
  private _dataCadastro: Date;

  constructor(id: number | undefined, endereco: Endereco | null = null, dataCadastro: Date = new Date()) {
    this._id = id;
    this._endereco = endereco;
    this._dataCadastro = dataCadastro;
  };

  public get id(): number | undefined { return this._id; };
  public get endereco(): Endereco | null { return this._endereco; };
  public get dataCadastro(): Date { return this._dataCadastro; };

  public cadastrarEndereco(endereco: Endereco): Endereco {
    this._endereco = endereco;
    return this._endereco;
  };

  public toJSON(filhos?: object) {
    return {
      id: this._id,
      dataCadastro: this._dataCadastro,
      endereco: this._endereco ? this._endereco.toJSON() : null,
      ...filhos
    };
  };
};

export default PessoaBase;