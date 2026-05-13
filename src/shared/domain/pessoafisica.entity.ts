import { cpf as validarCPF } from "cpf-cnpj-validator";
import Pessoa from "./pessoa.entity";

class PessoaFisica extends Pessoa {
  private _nome: string;
  private _cpf: string;

  constructor(
    nome: string,
    cpf: string,
    dataCadastro?: Date
  ) {
    super(dataCadastro);
    
    // Validações delegadas para métodos privados mantêm o construtor limpo
    this.validarNome(nome);
    this.validarCpf(cpf);

    this._nome = nome;
    this._cpf = cpf;
  };

  // --- Getters & Setters ---
  public get nome(): string { return this._nome; };
  public set nome(novo_nome: string) {
    this.validarNome(novo_nome);
    this._nome = novo_nome;
  };

  public get cpf(): string { return this._cpf; };

  // --- Implementação do Contrato Abstrato ---
  public get documento(): string { return this._cpf; }
  public get nomeExibicao(): string { return this._nome; }

  // --- Validações Privadas (Blindagem do Modelo) ---
  private validarNome(nome: string): void {
    if (!nome || nome.trim() === "") throw new Error("Nome não pode ser vazio!");
    if (nome.length < 3) throw new Error("Nome deve conter pelo menos 3 letras!");
    if (/\d/.test(nome)) throw new Error("Nome não pode conter números!");
  };

  private validarCpf(cpf: string): void {
    if (!cpf) throw new Error("CPF não pode ser vazio!");
    if (!/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf)) {
      throw new Error("CPF deve estar no formato válido (XXX.XXX.XXX-XX)");
    }
    if (!validarCPF.isValid(cpf)) throw new Error("CPF inválido!");
  };

  // --- Saídas ---
  public toJSON(filhos?: object) {
    return super.toJSON({
      nome: this._nome,
      cpf: this._cpf,
      ...filhos
    });
  };

  public toString(): string {
    return `Nome: ${this._nome}\nCPF: ${this._cpf}\n${super.toString()}`;
  };
}

export default PessoaFisica;