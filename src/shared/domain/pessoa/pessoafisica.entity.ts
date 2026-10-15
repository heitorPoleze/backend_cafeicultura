import PessoaBase from './pessoabase.entity';
import Endereco from '../endereco/endereco.vo';

class PessoaFisica extends PessoaBase {
  private _nome: string;
  private _cpf: string | null;

  constructor(
    id: number | undefined, 
    idAdministrador: number | null, 
    nome: string,
    cpf: string | null, 
    endereco: Endereco | null = null, 
    dataCadastro: Date, 
    papel: string | null = null
  ) {
    super(id, idAdministrador, endereco, dataCadastro, papel);
    this._nome = nome;
    this._cpf = cpf;
  };

  public get nome(): string { return this._nome; };
  public get cpf(): string | null { return this._cpf; };

  public toJSON(filhos?: object) {
    return super.toJSON({
      nome: this._nome,
      cpf: this._cpf,
      ...filhos
    });
  };
}

export default PessoaFisica;