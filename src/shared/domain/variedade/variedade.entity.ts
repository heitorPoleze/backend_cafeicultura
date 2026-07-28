import { Especie } from "../../../features/talhao/talhao.entity";

export default class Variedade {
    private _id: number;
    private _descricao: string;
    private _especie: Especie;

    constructor(id: number, descricao: string, especie: Especie) {
        this._id = id;
        this._descricao = descricao;
        this._especie = especie;
    }
    get id(): number {
        return this._id;
    }
    get descricao(): string {
        return this._descricao;
    }
    get especie(): Especie {
        return this._especie;
    }
    toJSON() {
        return {
            id: this.id,
            descricao: this.descricao,
            especie: this.especie
        }
    }
}