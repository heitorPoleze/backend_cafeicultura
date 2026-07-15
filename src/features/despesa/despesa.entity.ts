import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";
import TransacaoFinanceira, { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";

class Despesa extends TransacaoFinanceira {
    private _beneficiado: PessoaFisica | PessoaJuridica;
    private _descricao: string; 

    constructor(
        id: number | undefined,
        idPropriedade: number,
        dataHora: Date,
        valor: number,
        formaPagamento: FormaPagamento,
        tipoOperacao: TipoOperacao,
        beneficiado: PessoaFisica | PessoaJuridica,
        descricao: string
    ) {
        super(id, idPropriedade, dataHora, valor, formaPagamento, tipoOperacao);

        if (!beneficiado) throw new Error('O beneficiado é obrigatório.');
        this._beneficiado = beneficiado;

        if (!descricao) throw new Error('A descrição é obrigatória.');
        if (descricao.length < 3) throw new Error('A descrição deve ter no mínimo 3 caracteres.');
        this._descricao = descricao;
    }

    public get beneficiado(): PessoaFisica | PessoaJuridica { return this._beneficiado; }
    public get descricao(): string { return this._descricao; }

    public toJSON(filhos?: object) {
        return super.toJSON({
            beneficiado: this._beneficiado.toJSON(),
            descricao: this._descricao,
            ...filhos
        });
    }
}

export default Despesa;