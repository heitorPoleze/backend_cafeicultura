import { Login } from "./Login";
import { Pessoa } from "./Pessoa";

export class Proprietario extends Pessoa {
    private _login: Login;

    constructor(nome: string, cpf: string, cnpj: string, login: Login, id?: number){
        super(nome, cpf, cnpj, id);
        this._login = login;
    }

    get login(): Login {
        return this._login;
    }

    set login(login: Login) {
        this._login = login;   
    }

    toString(): string {
        return super.toString() + 
        `\nLogin: ${this._login.toString()}`; 
    }
}