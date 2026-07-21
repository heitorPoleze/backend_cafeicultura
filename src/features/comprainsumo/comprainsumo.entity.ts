import Insumo from "../../shared/domain/insumo/insumo.entity";
import Despesa from "../despesa/despesa.entity";

class CompraInsumo {
  constructor(
    private readonly _id: number | undefined,
    private _insumo: Insumo,
    private _despesa: Despesa,
    private _qtdComprada: number
  ) {
    if (_qtdComprada <= 0) throw new Error("A quantidade comprada deve ser maior que zero.");
  }

  public get id(): number | undefined { return this._id; }
  public get insumo(): Insumo { return this._insumo; }
  public get despesa(): Despesa { return this._despesa; }
  public get qtdComprada(): number { return this._qtdComprada; }

  public toJSON() {
    return {
      id: this._id,
      insumo: this._insumo.toJSON(),
      despesa: this._despesa.toJSON(),
      qtdComprada: this._qtdComprada
    };
  }
}

export default CompraInsumo;