import { cnpj as validarCNPJ } from "cpf-cnpj-validator";
import Pessoa from "./pessoa.entity";

class PessoaJuridica extends Pessoa {
  private _razaoSocial: string;
  private _cnpj: string;
  private _inscricaoEstadual?: string;

  constructor(
    razaoSocial: string,
    cnpj: string,
    inscricaoEstadual?: string,
    dataCadastro?: Date
  ) {
    super(dataCadastro);

    this.validarRazaoSocial(razaoSocial);
    this.validarCnpj(cnpj);
    if (inscricaoEstadual) this.validarInscricaoEstadual(inscricaoEstadual);

    this._razaoSocial = razaoSocial;
    this._cnpj = cnpj;
    this._inscricaoEstadual = inscricaoEstadual;
  };

  // --- Getters & Setters ---
  public get razaoSocial(): string { return this._razaoSocial; };
  public set razaoSocial(nova_razao: string) {
    this.validarRazaoSocial(nova_razao);
    this._razaoSocial = nova_razao;
  };

  public get cnpj(): string { return this._cnpj; };

  public get inscricaoEstadual(): string | undefined { return this._inscricaoEstadual; };
  public set inscricaoEstadual(nova_ie: string | undefined) {
    if (nova_ie) this.validarInscricaoEstadual(nova_ie);
    this._inscricaoEstadual = nova_ie;
  };

  // --- Implementação do Contrato Abstrato ---
  public get documento(): string { return this._cnpj; };
  public get nomeExibicao(): string { return this._razaoSocial; };

  // --- Validações Privadas (Blindagem do Modelo) ---
  private validarRazaoSocial(razaoSocial: string): void {
    if (!razaoSocial || razaoSocial.trim() === "") throw new Error("Razão social não pode ser vazia!");
    if (razaoSocial.length < 3) throw new Error("Razão social deve conter pelo menos 3 letras!");
  };

  private validarCnpj(cnpj: string): void {
    if (!cnpj) throw new Error("CNPJ não pode ser vazio!");
    if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(cnpj)) {
      throw new Error("CNPJ deve estar no formato válido (XX.XXX.XXX/XXXX-XX)");
    }
    if (!validarCNPJ.isValid(cnpj)) throw new Error("CNPJ inválido!");
  };

  private validarInscricaoEstadual(ie: string): void {
    if (ie.trim() === "") throw new Error("Inscrição estadual não pode ser apenas espaços em branco!");
  };

  // --- Saídas ---
  public toJSON(filhos?: object) {
    return super.toJSON({
      razaoSocial: this._razaoSocial,
      cnpj: this._cnpj,
      inscricaoEstadual: this._inscricaoEstadual || null,
      ...filhos,
    });
  };

  public toString(): string {
    const ieString = this._inscricaoEstadual ? `\nInscrição estadual: ${this._inscricaoEstadual}` : "";
    return `Razão social: ${this._razaoSocial}\nCNPJ: ${this._cnpj}${ieString}\n${super.toString()}`;
  };
}

export default PessoaJuridica;