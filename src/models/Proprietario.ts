import { Pessoa } from "./Pessoa";

export class Proprietario extends Pessoa {
//TODO: implementar login e classe usuario
    constructor(nome: string, cpf: string, id?: number){
        super(nome, cpf, id);
    }

    toString(): string {
        return super.toString(); 
    }
}