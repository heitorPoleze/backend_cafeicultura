import { Evento } from "./Evento";
import { Pessoa } from "./Pessoa";
import { Propriedade } from "./Propriedade";

export class Colheita extends Evento {
    private _quantidadeSacosColhidos: number;

    constructor(dataInicioEvento: Date, descricao: string, propriedade: Propriedade, responsaveis: Pessoa[], quantidadeSacosColhidos: number, id?: number){
        super(dataInicioEvento, descricao, propriedade, responsaveis, id);
        if(quantidadeSacosColhidos <= 0) {
            throw new Error("A quantidade de sacos colhidos deve ser um valor positivo.");
        }
        this._quantidadeSacosColhidos = quantidadeSacosColhidos;
    }

    get quantidadeSacosColhidos(): number {
        return this._quantidadeSacosColhidos;
    }

    set quantidadeSacosColhidos(quantidadeSacosColhidos: number) {
        if(quantidadeSacosColhidos <= 0) {
            throw new Error("A quantidade de sacos colhidos deve ser um valor positivo.");
        }
        this._quantidadeSacosColhidos = quantidadeSacosColhidos;
    }
}