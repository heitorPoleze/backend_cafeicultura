import Insumo from "../insumo.entity";
import Despesa from "../../../../features/despesa/despesa.entity";

class CompraInsumo {
    private _despesa: Despesa;
    private _insumo: Insumo;
    private _qtdComprada: number;

    constructor(
        despesa: Despesa, 
        insumo: Insumo, 
        qtdComprada: number
    ) {
        if (!despesa) throw new Error('A despesa é obrigatória.');
        this._despesa = despesa;

        if (!insumo) throw new Error('O insumo é obrigatório.');
        this._insumo = insumo;

        if (qtdComprada <= 0) throw new Error('A quantidade comprada deve ser maior que zero.');
        this._qtdComprada = qtdComprada;
    }

    public get despesa(): Despesa { return this._despesa; };
    public get insumo(): Insumo { return this._insumo; };
    public get qtdComprada(): number { return this._qtdComprada; };

    public toJSON() {
        return {
            despesa: this._despesa.toJSON(),
            insumo: this._insumo.toJSON(),
            qtdComprada: this._qtdComprada,
        };
    };
}

export default CompraInsumo;