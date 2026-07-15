import PessoaBase from './pessoabase.entity';
import Endereco from '../endereco/endereco.vo';
import { cnpj as cnpjValidator} from 'cpf-cnpj-validator';
import Pessoa from './pessoa.interface';

class PessoaJuridica extends PessoaBase {
  private _cnpj: string;
  private _razaoSocial: string;
  private _inscrEstadual: string | null;

  constructor(
    id: number | undefined,
    idAdministrador: number | null,
    cnpj: string,
    razaoSocial: string,
    inscrEstadual: string | null = null,
    endereco: Endereco | null = null,
    dataCadastro: Date
  ) {
    super(id, idAdministrador, endereco, dataCadastro);

    if (!cnpjValidator.isValid(cnpj)) {
      throw new Error("CNPJ inválido. O CNPJ deve conter 18 caracteres. Formato: XX.XXX.XXX/XXXX-XX");
    };
    this._cnpj = cnpj;

    this.validarRazaoSocial(razaoSocial);
    this._razaoSocial = razaoSocial;
    this._inscrEstadual = inscrEstadual;
  };

  public get cnpj(): string { return this._cnpj; };
  public get razaoSocial(): string { return this._razaoSocial; };
  public get inscrEstadual(): string | null { return this._inscrEstadual; };

  private validarRazaoSocial(razaoSocial: string) {
    if (!razaoSocial || razaoSocial.trim() === "") {
      throw new Error("Razão Social é obrigatória.");
    };
    if (razaoSocial.length < 3) {
      throw new Error("Razão Social deve ter no mínimo 3 caracteres.");
    };
    if (razaoSocial.length > 100) {
      throw new Error("Razão Social deve ter no máximo 100 caracteres.");
    };
  };

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