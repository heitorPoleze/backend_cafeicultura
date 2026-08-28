import { TipoEvento, TipoNotificacao } from "./notificacao.dto";

class Notificacao {
    private readonly _id: number | undefined;
    private _idProprietario: number;
    private _idPropriedade: number;
    private _idEvento: number;
    private _tipoEvento: TipoEvento;
    private _tipoNotificacao: TipoNotificacao;
    private _dataCriacao: Date;
    private _lida: boolean;

    constructor(id: number | undefined, idProprietario: number, idPropriedade: number, idEvento: number, tipoEvento: TipoEvento, tipoNotificaocao: TipoNotificacao, dataCriacao: Date = new Date(), lida: boolean = false) {
        this._id = id;
        this._idProprietario = idProprietario;
        this._idPropriedade = idPropriedade;
        this._idEvento = idEvento;
        this._tipoEvento = tipoEvento;
        this._tipoNotificacao = tipoNotificaocao;
        this._dataCriacao = dataCriacao;
        this._lida = lida;
    };

    get id() { return this._id; }
    get idProprietario() { return this._idProprietario; }
    get idPropriedade() { return this._idPropriedade; }
    get idEvento() { return this._idEvento; }
    get tipoEvento() { return this._tipoEvento; }
    get tipoNotificacao() { return this._tipoNotificacao; }
    get dataCriacao() { return this._dataCriacao; }
    get lida() { return this._lida; }

    public toJSON(){
        return {
            id: this._id,
            idProprietario: this._idProprietario,
            idPropriedade: this._idPropriedade, 
            idEvento: this._idEvento,
            tipoEvento: this._tipoEvento,
            tipoNotificacao: this._tipoNotificacao,
            dataCriacao: this._dataCriacao,
            lida: this._lida
        };
    }
}

export default Notificacao;