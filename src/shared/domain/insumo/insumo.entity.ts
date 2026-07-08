export enum MedidaInsumo {
  UN = "un",
  T = "t",
  KG = "kg",
  G = "g",
  MG = "mg",
  KL = "kl",
  L = "l",
  ML = "ml",
  M3 = "m3",
};

class Insumo {
  private readonly _id: number | undefined;
  private _descricao: string;
  private _medida: MedidaInsumo;

  constructor(id: number | undefined, descricao: string, medida: MedidaInsumo) {
    if (id && id <= 0) throw new Error("O id deve ser maior que zero.");
    this._id = id;

    if (!descricao) throw new Error("A descrição é obrigatória.");
    this._descricao = descricao;

    if (!medida) throw new Error("A medida é obrigatória.");
    if (!Object.values(MedidaInsumo).includes(medida))
      throw new Error("A medida é inválida.");
    this._medida = medida;
  };

  public get id(): number | undefined {
    return this._id;
  };
  public get descricao(): string {
    return this._descricao;
  };
  public get medida(): string {
    return this._medida;
  };

  public toJSON() {
    return {
      id: this._id,
      descricao: this._descricao,
      medida: this._medida,
    };
  }
}
export default Insumo;
