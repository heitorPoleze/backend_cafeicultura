class Tamanho {
  private _valor: number;
  private _medida: "hectare" | "m2";
  private _id?: number;
  constructor(
    valor: number,
    medida: "hectare" | "m2",
    id?: number
  ) {
    if (valor <= 0) throw new Error("O valor do tamanho deve ser maior que zero.");
    this._valor = valor;
    this._medida = medida;
    this._id = id;
  }

  public get id(): number | undefined { return this._id; }
  public get valor(): number { return this._valor; }
  public get medida(): "hectare" | "m2" { return this._medida; }

  public converterTamanhoEmM2(): void {
    if (this._medida === "hectare") {
      this._valor = this._valor * 10000;
      this._medida = "m2";
    }
  }

  public converterTamanhoEmHectares(): void {
    if (this._medida === "m2") {
      this._valor = this._valor / 10000;
      this._medida = "hectare";
    }
  }

  public toJSON() {
    return { valor: this._valor, medida: this._medida };
  }
}

export default Tamanho;