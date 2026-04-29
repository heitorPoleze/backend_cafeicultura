import { Endereco } from "./Endereco";
import { Proprietario } from "./Proprietario";
import { Tamanho } from "./Tamanho";
import { validarNome } from "../utils/validators";

export class Propriedade {
    private _id: number | undefined;
    private _nome: string;
    private _proprietario: Proprietario;
    private _endereco: Endereco;
    private _tamanho: Tamanho;

    constructor(nome: string, proprietario: Proprietario, endereco: Endereco, tamanho: Tamanho, id?: number){
        this._id = id;
        this._nome = validarNome(nome);
        this._proprietario = proprietario;
        this._endereco = endereco;
        this._tamanho = tamanho;
    }

    get id(): number | undefined{
        return this._id;
    }

    get nome(): string {
        return this._nome;
    }

    get proprietario(): Proprietario {
        return this._proprietario;
    }

    get endereco(): Endereco {
        return this._endereco;
    }

    get tamanho(): Tamanho {
        return this._tamanho;
    }

    set nome(nome: string) {
        this._nome = validarNome(nome);
    }

    set proprietario(proprietario: Proprietario) {
        this._proprietario = proprietario;
    }

    set endereco(endereco: Endereco) {
        this._endereco = endereco;
    }

    set tamanho(tamanho: Tamanho) {
        this._tamanho = tamanho;
    }

    toString(): string {
        return `
        \nID: ${this._id}
        \nNome: ${this._nome}
        \nProprietário: ${this._proprietario.toString()}
        \nEndereço: ${this._endereco.toString()}
        \nÁrea Total: ${this._tamanho.toString()}`;
    }

    toJSON(): object {
        return {
            id: this.id,
            nome: this.nome,
            proprietario: this.proprietario,
            endereco: this.endereco,
            tamanho: this.tamanho
        }
    }

    static fromJSON(json: any): Propriedade {
        return new Propriedade(
            json.nome,
            Proprietario.fromJSON(json.proprietario),
            Endereco.fromJSON(json.endereco),
            Tamanho.fromJSON(json.tamanho)
        );
    }
}