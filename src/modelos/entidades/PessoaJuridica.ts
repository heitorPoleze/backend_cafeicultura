import { cnpj as validarCNPJ } from "cpf-cnpj-validator";
import Pessoa from "./Pessoa";

class PessoaJuridica extends Pessoa {
  private _razaoSocial: string;
  private _cnpj: string | undefined;
  private _inscricaoEstadual: string | undefined;

  constructor(
    id: number | undefined,
    razaoSocial: string,
    cnpj: string | undefined,
    inscricaoEstadual?: string | undefined,
  ) {
    super(id);

    if (razaoSocial == "") throw new Error("Razao social nao pode ser vazio!");
    if (razaoSocial.length < 3)
      throw new Error("Razao social deve conter pelo menos 3 letras!");
    this._razaoSocial = razaoSocial;

    if (cnpj) {
      if (cnpj == "") throw new Error("CNPJ nao pode ser vazio!");
      if (!cnpj.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/))
        throw new Error(
          "CNPJ deve estar em formato valido (XX.XXX.XXX/XXXX-XX)"
        );
      if (!validarCNPJ.isValid(cnpj)) throw new Error("CNPJ inválido!");
      this._cnpj = cnpj;
    }

    if (inscricaoEstadual) {
      if (inscricaoEstadual == "")
        throw new Error("Inscrição estadual não pode ser vazia!");
      this._inscricaoEstadual = inscricaoEstadual;
    }
  }

  public get razaoSocial(): string {
    return this._razaoSocial;
  }

  public set razaoSocial(novo_valor: string) {
    if (novo_valor == "") throw new Error("Razao social nao pode ser vazio!");
    if (novo_valor.length < 3)
      throw new Error("Razao social deve conter pelo menos 3 letras!");
    this._razaoSocial = novo_valor;
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

  public get inscricaoEstadual(): string | undefined {
    return this._inscricaoEstadual;
  }


  public set inscricaoEstadual(novo_valor: string) {
    if (novo_valor == "") throw new Error("Inscrição estadual nao pode ser vazia!");
    this._inscricaoEstadual = novo_valor;
  }

  public toJSON(filhos?: object) {
    return super.toJSON({
      razaoSocial: this._razaoSocial,
      cnpj: this._cnpj,
      inscricaoEstadual: this._inscricaoEstadual,
      ...filhos,
    });
  }

  public toString(): string {
    return (
      "Razão social: " +
      this._razaoSocial +
      "\n" +
      "CNPJ: " +
      this._cnpj +
      "\n" +
      "Inscrição estadual: " +
      this._inscricaoEstadual +
      "\n" +
      super.toString()
    );
  }
}
export default PessoaJuridica;