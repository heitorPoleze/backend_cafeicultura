//TODO: Implementar transação financeira

import { validarNome } from "../utils/validators";
import { Pessoa } from "./Pessoa";
import { Propriedade } from "./Propriedade";

export class Evento {
    private _id: number | undefined;
    private _dataInicioEvento: Date;
    private _dataFimEvento: Date | undefined;
    private _descricao: string;
    private _propriedade: Propriedade;
    private _responsaveis: Pessoa[];

    constructor(dataInicioEvento: Date, descricao: string, propriedade: Propriedade, responsaveis: Pessoa[], id?: number){
        this._id = id;
        this._dataInicioEvento = dataInicioEvento;
        this._descricao = validarNome(descricao);
        this._propriedade = propriedade;
        this._responsaveis = responsaveis;
    }

    get id(): number | undefined {
        return this._id;
    }

    get dataInicioEvento(): Date {
        return this._dataInicioEvento;
    }

    get dataFimEvento(): Date | undefined {
        return this._dataFimEvento;
    }

    get descricao(): string {
        return this._descricao;
    }

    get propriedade(): Propriedade {
        return this._propriedade;
    }

    get responsaveis(): Pessoa[] {
        return this._responsaveis;
    }

    set descricao(descricao: string) {
        this._descricao = validarNome(descricao);
    }

    set responsaveis(responsaveis: Pessoa[]) {
        this._responsaveis = responsaveis;
    }

    finalizarEvento(dataFimEvento: Date): void {
        if(dataFimEvento < this._dataInicioEvento){
            throw new Error("A data de fim do evento não pode ser anterior à data de início.");
        }else{
            this._dataFimEvento = dataFimEvento;
        }
    }

    toString(): string {
        return `Evento: ${this._descricao}\nData de início: ${this._dataInicioEvento.toLocaleDateString()}\nData de fim: ${this._dataFimEvento ? this._dataFimEvento.toLocaleDateString() : "Em andamento"}\nPropriedade: ${this._propriedade.toString()}\nResponsáveis: ${this._responsaveis.map(responsavel => responsavel.toString()).join(", ")}`;
    }
}