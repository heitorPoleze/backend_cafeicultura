import Insumo from "../insumo.entity";

class TratoInsumo {
    private _insumo: Insumo;
    private _qtdUsada: number;

    constructor(
        insumo: Insumo, 
        qtdUsada: number
    ) {

        if (!insumo) throw new Error('O insumo é obrigatório.');
        this._insumo = insumo;

        if (qtdUsada <= 0) throw new Error('A quantidade usada deve ser maior que zero.');
        this._qtdUsada = qtdUsada;
    };

    public get insumo(): Insumo { return this._insumo; };
    public get qtdUsada(): number { return this._qtdUsada; };

    public toJSON() {
        return {
            insumo: this._insumo.toJSON(),
            qtdUsada: this._qtdUsada
        };
    };
};

export default TratoInsumo;