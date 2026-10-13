import PessoaBase from './pessoabase.entity';
import Endereco from '../endereco/endereco.vo';
class PessoaJuridica extends PessoaBase {
  private _razaoSocial: string;
  private _cnpj: string | null;
  private _inscrEstadual: string | null;

  constructor(
    id: number | undefined,
    idAdministrador: number | null,
    cnpj: string | null,
    razaoSocial: string,
    inscrEstadual: string | null = null,
    endereco: Endereco | null = null,
    dataCadastro: Date,
    papel:string | null = null
  ) {
    super(id, idAdministrador, endereco, dataCadastro,papel);
    this._cnpj = cnpj;
    this._razaoSocial = razaoSocial;
    this._inscrEstadual = inscrEstadual;
  };

  public get cnpj(): string | null { return this._cnpj; };
  public get razaoSocial(): string { return this._razaoSocial; };
  public get inscrEstadual(): string | null { return this._inscrEstadual; };


  public toJSON(filhos?: object) {
    return super.toJSON({
      cnpj: this.cnpj,
      razaoSocial: this.razaoSocial,
      inscrEstadual: this.inscrEstadual,
      ...filhos
    });
  };
}
export default PessoaJuridica;