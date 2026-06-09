class Endereco{
    private _idEndereco?: number;
    private _cidade: string;
    private _bairro: string;
    private _cep: string;
    private _uf: string;
    private _pais: string;
    private _logradouro: string;

    constructor(cidade: string, bairro: string, cep: string, uf: string, pais: string, logradouro: string, idEndereco?: number){
        this._idEndereco = idEndereco;
        this._cidade = cidade;
        this._bairro = bairro;
        this._cep = cep;
        this._uf = uf;
        this._pais = pais;
        this._logradouro = logradouro;
    }
    public get idEndereco(): number | undefined {
        return this._idEndereco;
    }
    public get cidade(): string{
        return this._cidade;
    }
    public get bairro(): string{
        return this._bairro;
    }
    public get cep(): string{
        return this._cep;
    }
    public get uf(): string{
        return this._uf;
    }
    public get pais(): string{
        return this._pais;
    }
    public get logradouro(): string{
        return this._logradouro;
    }
    public toJSON(){
        return {
            cidade: this._cidade,
            bairro: this._bairro,
            cep: this._cep,
            uf: this._uf,
            pais: this._pais,
            logradouro: this._logradouro
        }
    }
    public toString(){
        return `Cidade: ${this._cidade}\`
        Bairro: ${this._bairro}\n
        cep: ${this._cep}\n
        uf: ${this._uf}\n
        País: ${this._pais}\n
        Logradouro: ${this._logradouro}`
    }
}
export default Endereco;
