type undMedida = "m²" | "ha";

export class Tamanho {
    private _id: number | undefined;
    private _area: number;
    private _undMedida: undMedida;

    constructor(area: number, undMedida: undMedida, id?: number){
        this._id = id;
        this._area = area;
        this._undMedida = undMedida;
    }

    get id(): number | undefined{
        return this._id;
    }

    get area(): number {
        return this._area;
    }

    get undMedida(): undMedida {
        return this._undMedida;
    }

    set area(area: number) {
        this._area = area;
    }

    set undMedida(undMedida: undMedida) {
        this._undMedida = undMedida;
    }


    converterHaEmM2(): void {
        if(this._undMedida == "ha")
            this.undMedida = "m²";
            this._area = this._area * 10000;
    }

    converterM2EmHa(): void {
        if(this._undMedida == "m²")
            this.undMedida = "ha";
            this.area = this._area / 10000;
        
    }

    toString(): string {
        return `
        \nID: ${this._id}
        \nÁrea: ${this._area} ${this._undMedida}`;
    }
}