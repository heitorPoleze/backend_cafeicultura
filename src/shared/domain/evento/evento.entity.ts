import Safra from "../../../features/safra/safra.entity";
import Pessoa from "../pessoa/pessoabase.entity";
import TransacaoFinanceira from "../transacaofinanceira/transacaofinanceira.entity";

abstract class Evento {
    private readonly _id: number | undefined;
    private _dataInicio: Date;
    private _dataFim: Date | null;
    private _descricao: string;
    private _dataCadastro: Date;
    private _safra: Safra;
    private _transacoesFinanceiras?: TransacaoFinanceira[];
    private _responsaveis?: Pessoa[];
    private _confirmado?: boolean;

    constructor(
        id: number | undefined,
        dataInicio: Date,
        dataFim: Date | null,
        descricao: string,
        dataCadastro: Date = new Date(),
        safra: Safra,
        transacoesFinanceiras?: TransacaoFinanceira[],
        responsaveis?: Pessoa[],
        confirmado?: boolean
    ) {
        if (id && id <= 0) throw new Error('O id do evento deve ser maior que zero.');
        this._id = id;

        if (dataInicio < safra.dataInicio) throw new Error(`DATA_INICIO_ANTERIOR`);
        this._dataInicio = dataInicio;

        if (dataFim && dataFim < dataInicio) throw new Error(`DATA_FIM_ANTERIOR`);
        this._dataFim = dataFim;

        if (!descricao) throw new Error('A descrição do evento é obrigatória.');
        if (descricao.length < 3) throw new Error('A descrição do evento deve ter no mínimo 3 caracteres.');
        this._descricao = descricao;

        this._dataCadastro = dataCadastro;

        if (!safra) throw new Error('A safra do evento é obrigatória.');
        if (!(safra instanceof Safra)) throw new Error('A safra do evento é inválida.');
        this._safra = safra;

        if (transacoesFinanceiras && transacoesFinanceiras.length > 0) {
            if (!(transacoesFinanceiras[0] instanceof TransacaoFinanceira)) throw new Error('As transações financeiras do evento é inválida.');
        };
        this._transacoesFinanceiras = transacoesFinanceiras;

        if (responsaveis && responsaveis.length > 0) {
            if (!(responsaveis[0] instanceof Pessoa)) throw new Error('Os responsáveis do evento é inválido.');
        };
        this._responsaveis = responsaveis;

        if (confirmado === undefined) 
            confirmado = false;
        this._confirmado = confirmado;
    };

    public get id(): number | undefined { return this._id; };
    public get dataInicio(): Date { return this._dataInicio; }
    public get dataFim(): Date | null { return this._dataFim; };
    public get descricao(): string { return this._descricao; }
    public get dataCadastro(): Date { return this._dataCadastro; };
    public get safra(): Safra { return this._safra; };
    public get transacoesFinanceiras(): TransacaoFinanceira[] | undefined { return this._transacoesFinanceiras; };
    public get responsaveis(): Pessoa[] | undefined { return this._responsaveis; }
    public get confirmado(): boolean | undefined { return this._confirmado; };
    

    public inserirTransacoes(transacoesFinanceiras: TransacaoFinanceira[]): void {
        if (!transacoesFinanceiras || transacoesFinanceiras.length === 0) throw new Error('As transações financeiras do evento são obrigatórias.');
        if (!(transacoesFinanceiras[0] instanceof TransacaoFinanceira)) throw new Error('As transações financeiras do evento são inválidas.');
        this._transacoesFinanceiras = transacoesFinanceiras;
    };

    public inserirResponsaveis(responsaveis: Pessoa[]): void {
        if (!responsaveis || responsaveis.length === 0) throw new Error('Os responsáveis do evento são obrigatórios.');
        if (!(responsaveis[0] instanceof Pessoa)) throw new Error('Os responsáveis do evento são inválidos.');
        this._responsaveis = responsaveis;
    };

    public finalizar(dataFim: Date): void {
        if (dataFim < this._dataInicio) 
            throw new Error("DATA_FIM_ANTERIOR");
        this._dataFim = dataFim;
    };

    public confirmar(): void {
        this._confirmado = true;
    };

    public toJSON(filhos?: object) {
        return {
            id: this._id,
            dataInicio: this._dataInicio,
            dataFim: this._dataFim,
            descricao: this._descricao,
            dataCadastro: this._dataCadastro,
            safra: this._safra.toJSON(),
            transacoesFinanceiras: this._transacoesFinanceiras?.map(transacao => transacao.toJSON()),
            responsaveis: this._responsaveis?.map(responsavel => responsavel.toJSON()),
            confirmado: this._confirmado,
            ...filhos
        };
    };
}

export default Evento;