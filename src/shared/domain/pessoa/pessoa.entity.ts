import Formatador from "../../utils/Formatador";
import Endereco from "../endereco/endereco.vo";

abstract class Pessoa {
  protected _idPessoa?: number;
  protected _dataCadastro: Date;
  protected _endereco?: Endereco; 
  constructor(idPessoa?: number, dataCadastro?: Date, endereco?: Endereco) {
    this._idPessoa = idPessoa;
    this._dataCadastro = dataCadastro || new Date();
    this._endereco = endereco;
  }
  public get idPessoa(): number | undefined { return this._idPessoa; }
  public abstract get dataCadastro(): Date;
  public abstract get endereco(): Endereco | undefined;
  public abstract get documentos(): string[] | undefined;
  public abstract get nomeExibicao(): string;
  
  public toJSON(filhos?: object) {
    return {
      dataCadastro: this._dataCadastro,
      ...(this._endereco && { endereco: this._endereco.toJSON() }),
      ...filhos,
    };
  }

  public toString(): string {
    return "Data e hora de cadastro: " + Formatador.dataFormatada(this._dataCadastro, true);
  }
}
export default Pessoa;