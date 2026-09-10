import PessoaBase from './pessoabase.entity';
import Pessoa from './pessoa.interface';
import Endereco from '../endereco/endereco.vo';
import { cpfValidator } from 'cpf-cnpj-validator';

class PessoaFisica extends PessoaBase {
  private _nome: string;
  private _cpf: string;

  constructor(id: number | undefined, idAdministrador: number | null, nome: string, cpf: string, endereco: Endereco | null = null, dataCadastro: Date,papel:string | null) {
    super(id, idAdministrador, endereco, dataCadastro, papel);
    this.validarNome(nome);
    this._nome = nome;

    if (!cpfValidator.isValid(cpf)) {
      throw new Error("CPF inválido. O CPF deve conter 14 caracteres. Formato: XXX.XXX.XXX-XX");
    };
    this._cpf = cpf;
  };
  
  public get nome(): string { return this._nome; };
  public get cpf(): string { return this._cpf; };

  private validarNome(nome: string) {
    if (!nome || nome.trim() === "") {
      throw new Error("Nome é obrigatório.");
    };
    if (nome.length < 3) {
      throw new Error("Nome deve ter no mínimo 3 caracteres.");
    };
    if (nome.length > 100) {
      throw new Error("Nome deve ter no máximo 100 caracteres.");
    };
  };

  public toJSON(filhos?: object) {
    return super.toJSON({
      nome: this._nome,
      cpf: this._cpf,
      ...filhos
    });
  };
}

export default PessoaFisica;