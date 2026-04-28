import { cpf as validarCPF } from "cpf-cnpj-validator";
import Pessoa from "./Pessoa";

abstract class PessoaFisica extends Pessoa {
  private _nome: string;
  private _cpf: string;

  constructor(
    id: number | undefined,
    nome: string,
    data_nascimento: Date,
    cpf: string,
  ) {
    super(id);
    if (nome == "") throw new Error("Nome não pode ser vazio!");
    if (nome.length < 3)
      throw new Error("Nome deve conter pelo menos 3 letras!");
    if (nome.match(/[0-9]/)) throw new Error("Nome não pode conter números!");
    this._nome = nome;

    if (cpf == "") throw new Error("CPF não pode ser vazio!");
    if (!cpf.match(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/))
      throw new Error("CPF deve estar em formato válido (XXX.XXX.XXX-XX)");
    if (!validarCPF.isValid(cpf)) throw new Error("CPF inválido!");
    this._cpf = cpf;
  }

  public get nome(): string {
    return this._nome;
  }

  public set nome(novo_valor: string) {
    if (novo_valor == "") throw new Error("Nome não pode ser vazio!");
    if (novo_valor.length < 3)
      throw new Error("Nome deve conter pelo menos 3 letras!");
    if (novo_valor.match(/[0-9]/))
      throw new Error("Nome não pode conter números!");
    this._nome = novo_valor;
  }

  public get cpf(): string {
    return this._cpf;
  }


  public toJSON(filhos?: object) {
    return super.toJSON(
      {
        nome: this._nome,
        cpf: this._cpf,
        ...filhos
      });
  }

  public toString(): string {
    return (
      "Nome: " +
      this._nome +
      "\n" +
      "CPF: " +
      this._cpf +
      "\n" +
      super.toString()
    );
  }
}
export default PessoaFisica;