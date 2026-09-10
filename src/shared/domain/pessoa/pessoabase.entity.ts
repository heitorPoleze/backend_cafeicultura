import Endereco from '../endereco/endereco.vo';
import Pessoa from './pessoa.interface';

abstract class PessoaBase implements Pessoa {
  private _id: number | undefined;
  private _idAdministrador: number | null;
  private _endereco: Endereco | null;
  private _dataCadastro: Date;
  private _papel: string | null = null;

  constructor(id: number | undefined, idAdministrador: number | null, endereco: Endereco | null = null, dataCadastro: Date = new Date(), papel:string| null) {
    this._id = id;
    this._idAdministrador = idAdministrador;
    this._endereco = endereco;
    this._dataCadastro = dataCadastro;
    this._papel = papel ||  null;
  };

  public get id(): number | undefined { return this._id; };
  public get idAdministrador(): number | null { return this._idAdministrador; };
  public get endereco(): Endereco | null { return this._endereco; };
  public get dataCadastro(): Date { return this._dataCadastro; };
  public get papel():string | null {
    return this._papel
  }
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