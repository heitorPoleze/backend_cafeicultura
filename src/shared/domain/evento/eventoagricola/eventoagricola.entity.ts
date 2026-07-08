import Safra from "../../../../features/safra/safra.entity";
import TransacaoFinanceira from "../../transacaofinanceira/transacaofinanceira.entity";
import Evento from "../evento.entity";
import Pessoa from "../../pessoa/pessoabase.entity";

abstract class EventoAgricola extends Evento {
  private _idTalhao: number;
  constructor(
    id: number | undefined,
    idTalhao: number,
    dataInicio: Date,
    dataFim: Date | null,
    descricao: string,
    dataCadastro: Date = new Date(),
    safra: Safra,
    transacoesFinanceiras?: TransacaoFinanceira[],
    responsaveis?: Pessoa[],
    confirmado?: boolean,
  ) {
    super(
      id,
      dataInicio,
      dataFim,
      descricao,
      dataCadastro,
      safra,
      transacoesFinanceiras,
      responsaveis,
      confirmado,
    );
    if (idTalhao <= 0)
      throw new Error("O id do talhão deve ser maior que zero.");
    this._idTalhao = idTalhao;
  };

  public get idTalhao(): number {
    return this._idTalhao;
  };

  public toJSON(filhos?: object) {
    return super.toJSON({
      idTalhao: this._idTalhao,
      ...filhos,
    });
  };
}

export default EventoAgricola;