type unidade_medida = "m²" | "ha";

export class Tamanho {
    private _id: number | undefined;
    private _area: number;
    private _unidade_medida: unidade_medida;

    constructor(area: number, unidade_medida: unidade_medida, id?: number){
        this._id = id;
        this._area = area;
        this._unidade_medida = unidade_medida;
    }

    get id(): number | undefined{
        return this._id;
    }

    get area(): number {
        return this._area;
    }

    get unidade_medida(): unidade_medida {
        return this._unidade_medida;
    }

    set area(area: number) {
        this._area = area;
    }

    set unidade_medida(unidade_medida: unidade_medida) {
        this._unidade_medida = unidade_medida;
    }


    converterHaEmM2(): void {
        if(this._unidade_medida == "ha")
            this.unidade_medida = "m²";
            this._area = this._area * 10000;
    }

    converterM2EmHa(): void {
        if(this._unidade_medida == "m²")
            this.unidade_medida = "ha";
            this.area = this._area / 10000;
        
    }

    toString(): string {
        return `
        \nID: ${this._id}
        \nÁrea: ${this._area} ${this._unidade_medida}`;
    }

    toJSON(): object {
        return {
            id: this._id,
            area: this._area,
            undMedida: this._unidade_medida
        }
    }
}