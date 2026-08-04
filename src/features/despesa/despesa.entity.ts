import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import TransacaoFinanceira, { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";

class Despesa extends TransacaoFinanceira {
    private _beneficiado: Pessoa;
    private _descricao: string; 

    constructor(
        id: number | undefined,
        idEvento: number | null,
        idPropriedade: number,
        dataHora: Date,
        valor: number,
        formaPagamento: FormaPagamento,
        tipoOperacao: TipoOperacao,
        beneficiado: Pessoa,
        descricao: string
    ) {
        super(id, idEvento, idPropriedade, dataHora, valor, formaPagamento, tipoOperacao);

        if (!beneficiado) throw new Error('O beneficiado é obrigatório.');
        this._beneficiado = beneficiado;

        this._descricao = descricao;
    }

    public get beneficiado(): Pessoa { return this._beneficiado; }
    public get descricao(): string { return this._descricao; }

    public toJSON() {
        return super.toJSON({
            beneficiado: this._beneficiado.toJSON(),
            descricao: this._descricao
        });
    }
}

export default Despesa;