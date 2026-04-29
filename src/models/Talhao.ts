import { validarNome } from "../utils/validators";
import { Propriedade } from "./Propriedade";
import { Tamanho } from "./Tamanho";

type tipoCafe = "Arábica" | "Conilon";
//TODO: Implementar Safra
export class Talhao {
    private _id: number | undefined;
    private _nome: string;
    private _tamanho: Tamanho;
    private _propriedade: Propriedade;
    private _qtdPesDeCafe: number;
    private _tipoCafe: tipoCafe;
    private _variedadesCafe: string[];
    private _dataInicioTalhao: Date;
    private _dataFimTalhao: Date | null;

    constructor(nome: string, tamanho: Tamanho, propriedade: Propriedade,qtdPesDeCafe: number, tipoCafe: tipoCafe, variedadesCafe: string[], dataInicioTalhao: Date, dataFimTalhao: Date | null, id?: number){
        this._id = id;
        this._nome = validarNome(nome);
        this._propriedade = propriedade;
        if(tamanho.converterHaEmM2() > propriedade.tamanho.converterHaEmM2()){
            throw new Error("O talhão não pode ter área maior que a propriedade.");
        }else if(tamanho.area <= 0){
            throw new Error("A área do talhão deve ser maior que zero.");
        }else{
            this._tamanho = tamanho;
        }
        if(qtdPesDeCafe <= 0){
            throw new Error("A quantidade de pés de café deve ser maior que zero.");
        }else{
            this._qtdPesDeCafe = qtdPesDeCafe;
        }
        this._tipoCafe = tipoCafe;
        this._variedadesCafe = variedadesCafe;
        this._dataInicioTalhao = dataInicioTalhao;
        this._dataFimTalhao = dataFimTalhao;
    }

    get id(): number | undefined {
        return this._id;
    }

    get nome(): string {
        return this._nome;
    }

    get tamanho(): Tamanho {
        return this._tamanho;
    }

    get qtdPesDeCafe(): number {
        return this._qtdPesDeCafe;
    }

    get tipoCafe(): tipoCafe {
        return this._tipoCafe;
    }

    get variedadesCafe(): string[] {
        return this._variedadesCafe;
    }

    get dataInicioTalhao(): Date {
        return this._dataInicioTalhao;
    }

    get propriedade(): Propriedade {
        return this._propriedade;
    }

    get dataFimTalhao(): Date | null {
        return this._dataFimTalhao;
    }

    toString(): string {
        return `[Talhão ID: ${this._id || "Novo"}] Nome: ${this._nome}, Tipo: ${this._tipoCafe}, Propriedade: ${this._propriedade.id}`;
    }

    toJSON(): object {
        return {
            id: this.id,
            nome: this.nome,
            tamanho: this.tamanho.toJSON(),
            propriedade: this.propriedade.toJSON(),
            qtdPesDeCafe: this.qtdPesDeCafe,
            tipoCafe: this.tipoCafe,
            variedadesCafe: this.variedadesCafe,
            dataInicioTalhao: this.dataInicioTalhao,
            dataFimTalhao: this.dataFimTalhao
        };
    }

    static fromJSON(json: any): Talhao {
        return new Talhao(
            json.nome,
            Tamanho.fromJSON(json.tamanho),
            Propriedade.fromJSON(json.propriedade),
            json.qtdPesDeCafe,
            json.tipoCafe,
            json.variedadesCafe,
            json.dataInicioTalhao,
            json.dataFimTalhao,
        )
    }
}