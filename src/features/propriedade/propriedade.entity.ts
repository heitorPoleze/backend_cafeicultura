import Endereco from "../../shared/domain/endereco/endereco.vo";
import Tamanho from "../../shared/domain/tamanho/tamanho.entity";

class Propriedade {
  private _nome: string;
  private _idProprietario: number;
  private _tamanho: Tamanho;
  private _endereco: Endereco;
  private _id?: number;

  constructor(
    nome: string,
    idProprietario: number,
    tamanho: Tamanho,
    endereco: Endereco,
    id?: number,
  ) {
    if (!nome || nome.trim() === "")
      throw new Error("O nome da propriedade é obrigatório.");

    this._nome = nome;
    this._idProprietario = idProprietario;
    this._tamanho = tamanho;
    this._endereco = endereco;
    this._id = id;
  };

  public get id(): number | undefined {
    return this._id;
  };
  public get nome(): string {
    return this._nome;
  };
  public get idProprietario(): number {
    return this._idProprietario;
  };
  public get tamanho(): Tamanho {
    return this._tamanho;
  };
  public get endereco(): Endereco {
    return this._endereco;
  };

  public set nome(nome: string) {
    this._nome = nome;
  }
  public set tamanho(tamanho: Tamanho) {
    this._tamanho = tamanho;
  }
  public set endereco(endereco: Endereco) {
    this._endereco = endereco;
  }

  public toJSON() {
    return {
      id: this._id,
      nome: this._nome,
      idProprietario: this._idProprietario,
      tamanho: this._tamanho.toJSON(),
      endereco: this._endereco.toJSON(),
    };
  };
}

export default Propriedade;
