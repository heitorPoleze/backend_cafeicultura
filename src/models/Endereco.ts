export class Endereco {
    private _id: number | undefined;
    private _CEP: string;
    private _pais: string;
    private _UF: string;
    private _cidade: string;
    private _bairro: string;
    private _logradouro: string;

    constructor(CEP: string, pais: string, UF: string, cidade: string, bairro: string, logradouro: string, id?: number){
        this._id = id;
        this._CEP = this.validarCEP(CEP);
        this._pais = pais;
        this._UF = this.validarUF(UF);
        this._cidade = cidade;
        this._bairro = bairro;
        this._logradouro = logradouro;
    }

    get id(): number | undefined{
        return this._id;
    }

    get CEP(): string {
        return this._CEP;
    }

    get pais(): string {
        return this._pais;
    }

    get UF(): string {
        return this._UF;
    }

    get cidade(): string {
        return this._cidade;
    }

    get bairro(): string {
        return this._bairro;
    }

    get logradouro(): string {
        return this._logradouro;
    }

    set CEP(CEP: string) {
        this._CEP = this.validarCEP(CEP);
    }

    set pais(pais: string) {
        this._pais = pais;
    }

    set UF(UF: string) {
        this._UF = this.validarUF(UF);
    }

    set cidade(cidade: string) {
        this._cidade = cidade;
    }

    set bairro(bairro: string) {
        this._bairro = bairro;
    }

    set logradouro(logradouro: string) {
        this._logradouro = logradouro;
    }

    validarCEP(CEP: string): string {
        if(CEP.length != 8)
            throw new RangeError("CEP inválido. Deve ter 8 dígitos")
        return CEP;
    }

    validarUF(UF: string): string {
        if(UF.length != 2)
            throw new RangeError("UF inválida. Deve ter 2 dígitos")
        return UF;
    }

    toString(): string {
        return `
        \nID: ${this._id}
        \nCEP: ${this._CEP}
        \nPaís: ${this._pais}
        \nUF: ${this._UF}
        \nCidade: ${this._cidade}
        \nBairro: ${this._bairro}
        \nLogradouro: ${this._logradouro}`;
    }

    toJSON(): object {
        return {
            id: this.id,
            CEP: this.CEP,
            pais: this.pais,
            UF: this.UF,
            cidade: this.cidade,
            bairro: this.bairro,
            logradouro: this.logradouro
        }
    }

    static fromJSON(json: any): Endereco {
        return new Endereco(
            json.CEP,
            json.pais,
            json.UF,
            json.cidade,
            json.bairro,
            json.logradouro
        );
    }
}
