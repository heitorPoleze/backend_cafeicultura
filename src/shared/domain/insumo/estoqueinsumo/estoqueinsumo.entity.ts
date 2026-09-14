class EstoqueInsumo {
    private readonly _id: number | undefined;
    private _idInsumo: number;
    private _idpropriedade: number;
    private _quantidade: number;

    constructor(id: number | undefined, idInsumo: number, idPropriedade: number, quantidade: number) {
        this._id = id;
        this._idInsumo = idInsumo;
        this._idpropriedade = idPropriedade;
        this._quantidade = quantidade;
    }

    public get id(): number | undefined { return this._id; }
    public get idInsumo(): number { return this._idInsumo; }
    public get idPropriedade(): number { return this._idpropriedade; }
    public get quantidade(): number { return this._quantidade; }

    public adicionar(quantidade: number) {
        if (quantidade <= 0) {
            throw new Error("VALOR_INVALIDO");
        }
        this._quantidade += quantidade;
    };

    public remover(quantidade: number) {
        if (quantidade <= 0) {
            throw new Error("VALOR_INVALIDO");
        }
        if (quantidade > this._quantidade) {
            throw new Error("ESTOQUE_INSUFICIENTE");
        }
        this._quantidade -= quantidade;
    };

    public toJSON() {
        return {
            id: this._id,
            idInsumo: this._idInsumo,
            idPropriedade: this._idpropriedade,
            quantidade: this._quantidade
        };
    };
}

export default EstoqueInsumo;