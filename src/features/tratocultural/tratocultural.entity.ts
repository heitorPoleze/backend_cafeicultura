import EventoAgricola from "../../shared/domain/evento/eventoagricola/eventoagricola.entity";
import Safra from "../safra/safra.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import Despesa from "../despesa/despesa.entity";

export enum TipoTrato {
    CAPINA = 'Capina',
    ADUBACAO = 'Adubação',
    PODA = 'Poda',
    REPLANTIO = 'Replantio',
    DEFENSIVO = 'Defensivo'
};

class TratoCultural extends EventoAgricola {
    private _tipoTrato: TipoTrato;
    private _insumosUtilizados?: TratoInsumo[];

    constructor(
        id: number | undefined,
        idTalhao: number,
        dataInicio: Date,
        dataFim: Date | null,
        descricao: string,
        dataCadastro: Date = new Date(),
        safra: Safra,
        transacoesFinanceiras: Despesa[] | undefined,
        responsaveis: Pessoa[] | undefined,
        confirmado: boolean | undefined,
        tipoTrato: TipoTrato,
        insumosUtilizados?: TratoInsumo[]
    ) {
        super(
            id,
            idTalhao,
            dataInicio,
            dataFim,
            descricao,
            dataCadastro,
            safra,
            transacoesFinanceiras,
            responsaveis,
            confirmado
        );

        if (!tipoTrato) throw new Error('O tipo de trato cultural é obrigatório.');
        if (!Object.values(TipoTrato).includes(tipoTrato)) throw new Error('O tipo de trato cultural é inválido.');
        this._tipoTrato = tipoTrato;


        if (insumosUtilizados && insumosUtilizados.length > 0) {
            if (!(insumosUtilizados[0] instanceof TratoInsumo)) throw new Error('Os insumos utilizados no trato cultural são inválidos.');
        };
        this._insumosUtilizados = insumosUtilizados;
    };

    public get tipoTrato(): TipoTrato { return this._tipoTrato; };
    public get insumosUtilizados(): TratoInsumo[] | undefined { return this._insumosUtilizados; };

    public inserirInsumos(insumos: TratoInsumo[]): void {
        if (!this._insumosUtilizados) 
            this._insumosUtilizados = [];
        this._insumosUtilizados.push(...insumos);
    };

    public excluirInsumos(idInsumos: number[]): void {
        this._insumosUtilizados = this._insumosUtilizados?.filter(tratoInsumo => !idInsumos.includes(tratoInsumo.insumo.id as number));
    };

    public toJSON() {
        return super.toJSON({
            tipoTrato: this._tipoTrato,
            ...(this._insumosUtilizados?.length && {
                insumosUtilizados: this._insumosUtilizados.map(insumo => insumo.toJSON())
            }),
    });
}
}

export default TratoCultural;