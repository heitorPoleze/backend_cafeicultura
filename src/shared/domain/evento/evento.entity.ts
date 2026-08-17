import Despesa from "../../../features/despesa/despesa.entity";
import Safra from "../../../features/safra/safra.entity";
import Pessoa from "../pessoa/pessoabase.entity";

abstract class Evento {
    private readonly _id: number | undefined;
    private _dataInicio: Date;
    private _dataFim: Date | null;
    private _descricao: string;
    private _dataCadastro: Date;
    private _safra: Safra;
    private _transacoesFinanceiras?: Despesa[];
    private _responsaveis?: Pessoa[];

    constructor(
        id: number | undefined,
        dataInicio: Date,
        dataFim: Date | null,
        descricao: string,
        dataCadastro: Date = new Date(),
        safra: Safra,
        transacoesFinanceiras?: Despesa[],
        responsaveis?: Pessoa[],
    ) {
        if (id && id <= 0) throw new Error('O id do evento deve ser maior que zero.');
        this._id = id;

        if (dataInicio < safra.dataInicio) throw new Error(`DATA_INICIO_ANTERIOR`);
        this._dataInicio = dataInicio;

        if (dataFim && dataFim < dataInicio) throw new Error(`DATA_FIM_ANTERIOR`);
        this._dataFim = dataFim;

        this._descricao = descricao;

        this._dataCadastro = dataCadastro;

        if (!safra) throw new Error('A safra do evento é obrigatória.');
        if (!(safra instanceof Safra)) throw new Error('A safra do evento é inválida.');
        this._safra = safra;

        if (transacoesFinanceiras && transacoesFinanceiras.length > 0) {
            if (!(transacoesFinanceiras[0] instanceof Despesa)) throw new Error('As transações financeiras do evento é inválida.');
        };
        this._transacoesFinanceiras = transacoesFinanceiras;

        if (responsaveis && responsaveis.length > 0) {
            if (!(responsaveis[0] instanceof Pessoa)) throw new Error('Os responsáveis do evento é inválido.');
        };
        this._responsaveis = responsaveis;
    };

    public get id(): number | undefined { return this._id; };
    public get dataInicio(): Date { return this._dataInicio; }
    public get dataFim(): Date | null { return this._dataFim; };
    public get descricao(): string { return this._descricao; }
    public get dataCadastro(): Date { return this._dataCadastro; };
    public get safra(): Safra { return this._safra; };
    public get transacoesFinanceiras(): Despesa[] | undefined { return this._transacoesFinanceiras; };
    public get responsaveis(): Pessoa[] | undefined { return this._responsaveis; }

    public set descricao(descricao: string) { this._descricao = descricao; };
    
    public editarResponsaveis(responsaveis: Pessoa[]): void {
        if (!this._responsaveis)
            this._responsaveis = [];
        this._responsaveis = responsaveis;
    };

    public excluirTransacoes(idTransacoes: number[]): void {
        this._transacoesFinanceiras = this._transacoesFinanceiras?.filter(transacao => idTransacoes.includes(transacao.id as number));
    };

    public editarInicio(dataInicio: Date): void {
        if (dataInicio < this._safra.dataInicio) 
            throw new Error("DATA_INICIO_ANTERIOR");
        this._dataInicio = dataInicio;
    };

    public finalizar(dataInicio: Date,dataFim: Date): void {
        if (dataInicio < this._safra.dataInicio) 
            throw new Error("DATA_INICIO_ANTERIOR");
        if (dataInicio > dataFim) 
            throw new Error("DATA_INICIO_SUPERIOR");
        if (dataFim < dataInicio) 
            throw new Error("DATA_FIM_ANTERIOR");
        if (dataFim > new Date()) 
            throw new Error("DATA_FIM_SUPERIOR");
        this._dataInicio = dataInicio;
        this._dataFim = dataFim;
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
            ...filhos
        };
    };
}

export default Evento;