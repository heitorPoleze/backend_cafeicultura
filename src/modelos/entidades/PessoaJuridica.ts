import { cnpj as validarCNPJ } from "cpf-cnpj-validator";
import Pessoa from "./Pessoa";

abstract class PessoaJuridica extends Pessoa {
  private _razao_social: string;
  private _cnpj: string | undefined;
  private _inscricao_estadual: string | undefined;

  constructor(
    id: number | undefined,
    razao_social: string,
    cnpj: string | undefined,
    inscricao_estadual?: string | undefined,
  ) {
    super(id);

    if (razao_social == "") throw new Error("Razao social nao pode ser vazio!");
    if (razao_social.length < 3)
      throw new Error("Razao social deve conter pelo menos 3 letras!");
    this._razao_social = razao_social;

    if (cnpj) {
      if (cnpj == "") throw new Error("CNPJ nao pode ser vazio!");
      if (!cnpj.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/))
        throw new Error(
          "CNPJ deve estar em formato valido (XX.XXX.XXX/XXXX-XX)"
        );
      if (!validarCNPJ.isValid(cnpj)) throw new Error("CNPJ inválido!");
      this._cnpj = cnpj;
    }

    if (inscricao_estadual) {
      if (inscricao_estadual == "")
        throw new Error("Inscrição estadual não pode ser vazia!");
      this._inscricao_estadual = inscricao_estadual;
    }
  }

  public get razao_social(): string {
    return this._razao_social;
  }

  public set razao_social(novo_valor: string) {
    if (novo_valor == "") throw new Error("Razao social nao pode ser vazio!");
    if (novo_valor.length < 3)
      throw new Error("Razao social deve conter pelo menos 3 letras!");
    this._razao_social = novo_valor;
  }

  public get cnpj(): string | undefined {
    return this._cnpj;
  }

  public set cnpj(novo_valor: string) {
    if (novo_valor == "") throw new Error("CNPJ nao pode ser vazio!");
    if (!novo_valor.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/))
      throw new Error("CNPJ deve estar em formato valido (XX.XXX.XXX/XXXX-XX)");
    if (!validarCNPJ.isValid(novo_valor)) throw new Error("CNPJ inválido!");
    this._cnpj = novo_valor;
  }

  public get inscricao_estadual(): string | undefined {
    return this._inscricao_estadual;
  }

  public set inscricao_estadual(novo_valor: string) {
    if (novo_valor == "") throw new Error("Inscrição estadual nao pode ser vazia!");
    this._inscricao_estadual = novo_valor;
  }

  public toJSON(filhos?: object) {
    return super.toJSON({
      razao_social: this._razao_social,
      cnpj: this._cnpj,
      inscricao_estadual: this._inscricao_estadual,
      ...filhos,
    });
  }

  public toString(): string {
    return (
      "Razão social: " +
      this._razao_social +
      "\n" +
      "CNPJ: " +
      this._cnpj +
      "\n" +
      "Inscrição estadual: " +
      this._inscricao_estadual +
      "\n" +
      super.toString()
    );
  }
}
export default PessoaJuridica;