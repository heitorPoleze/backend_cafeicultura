import { validarNome } from "../utils/validators";
//TODO: Implementar as subclasses de Pessoa
export class Pessoa {
    private _nome: string;
    private _cpf: string;
    private _cnpj: string;
    private _id: number | undefined;
    constructor(nome: string, cpf: string, cnpj: string, id?: number){
        this._id = id;
        this._nome = validarNome(nome);
        this._cpf = this.validarCPF(cpf);
        this._cnpj = this.validarCNPJ(cnpj);
    }

    get id(): number | undefined{
        return this._id;
    }

    get nome(): string {
        return this._nome;
    }

    get cpf(): string {
        return this._cpf;
    }

    get cnpj(): string {
        return this._cnpj;
    
    }

    set nome(nome: string) {
        this._nome = validarNome(nome);
    }

    set cpf(cpf: string) {
        this._cpf = this.validarCPF(cpf);
    }

    set cnpj(cnpj: string) {
        this._cnpj = this.validarCNPJ(cnpj);
    }

    toString(): string {
        return `
        \nID: ${this._id}       
        \nNome: ${this._nome}
        \nCPF: ${this._cpf}
        \nCNPJ: ${this._cnpj}`;
    
    }


    validarCPF(cpf: string): string {
        if(cpf.length != 11)
            throw new RangeError("CPF inválido. Deve ter 11 dígitos")
        return cpf;
    }

    validarCNPJ(cnpj: string): string {
        if(cnpj.length != 14)
            throw new RangeError("CNPJ inválido. Deve ter 14 dígitos")
        return cnpj;
    }

}