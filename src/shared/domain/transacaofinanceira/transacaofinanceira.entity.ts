export enum FormaPagamento {
  TED = 'TED',
  ESPECIE = 'Espécie',
  CARTAO_CREDITO = 'Cartão de Crédito',
  CARTAO_DEBITO = 'Cartão de Débito',
  CHEQUE = 'Cheque',
  PIX = 'Pix',
  SACAS = 'Sacas',
};

export enum TipoOperacao {
  MONETARIA = 'Monetária',
  REPASSE = 'Repasse',
};

abstract class TransacaoFinanceira {
  private readonly _id: number | undefined;
  private _idEvento: number | null;
  private _idPropriedade: number;
  private _dataHora: Date;
  private _valor: number;
  private _formaPagamento: FormaPagamento;
  private _tipoOperacao: TipoOperacao;

  constructor(
    id: number | undefined,
    idEvento: number | null,
    idPropriedade: number,
    dataHora: Date,
    valor: number,
    formaPagamento: FormaPagamento,
    tipoOperacao: TipoOperacao
    ) {
    if (id && id <= 0) throw new Error('O id da transação financeira deve ser maior que zero.');
    this._id = id;
    if (idEvento && idEvento <= 0) throw new Error('O id do evento deve ser maior que zero.');
    this._idEvento = idEvento;
    if (idPropriedade <= 0) throw new Error('O id da propriedade deve ser maior que zero.');
    this._idPropriedade = idPropriedade;
    this._dataHora = dataHora;
    if (valor <= 0) throw new Error('O valor da transação financeira deve ser maior que zero.');
    this._valor = valor;
    if (!formaPagamento) throw new Error('A forma de pagamento da transação financeira é obrigatória.');
    if (!Object.values(FormaPagamento).includes(formaPagamento)) throw new Error('A forma de pagamento da transação financeira é inválida.');
    if (formaPagamento === FormaPagamento.SACAS && tipoOperacao !== TipoOperacao.REPASSE) throw new Error('A forma de pagamento sacas só pode ser utilizada em transações do tipo repasse.');
    this._formaPagamento = formaPagamento;
    if (!tipoOperacao) throw new Error('O tipo de operação da transação financeira é obrigatório.');
    if (!Object.values(TipoOperacao).includes(tipoOperacao)) throw new Error('O tipo de operação da transação financeira é inválido.');
    if (formaPagamento !== FormaPagamento.SACAS && tipoOperacao === TipoOperacao.REPASSE) throw new Error('O tipo de operação repasse só pode ser utilizada em transações do tipo sacas.');
    this._tipoOperacao = tipoOperacao;
  };

    public get id(): number | undefined { return this._id; };
    public get idEvento(): number | null { return this._idEvento; };
    public set idEvento(idEvento: number) { this._idEvento = idEvento; };
    public get idPropriedade(): number { return this._idPropriedade; };
    public get dataHora(): Date { return this._dataHora; };
    public get valor(): number { return this._valor; };
    public get formaPagamento(): FormaPagamento { return this._formaPagamento; };
    public get tipoOperacao(): TipoOperacao { return this._tipoOperacao; };

    public toJSON(filhos?: object) {
      return {
        id: this._id,
        idEvento: this._idEvento,
        idPropriedade: this._idPropriedade,
        dataHora: this._dataHora,
        valor: this._valor,
        formaPagamento: this._formaPagamento,
        tipoOperacao: this._tipoOperacao,
        ...filhos
      };
    }
}

export default TransacaoFinanceira;