import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import bcrypt from "bcryptjs";

class Usuario {
  private _email: string;
  private _telefone: string;
  private _senha: string;
  private _perfil: Pessoa;

  constructor(
    email: string,
    telefone: string,
    senha: string,
    perfil: Pessoa,
  ){
    this._email = email;
    this._telefone = telefone;
    this._senha = senha;
    this._perfil = perfil;
  };
  

  get perfil(): Pessoa {
    return this._perfil;
  };
  
  public get email(): string {
    return this._email;
  };

  public get telefone(): string {
    return this._telefone;
  };

  public get senha(): string {
    return this._senha;
  };

  public async criptografarSenha(): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this._senha = await bcrypt.hash(this._senha, salt);
  };

  public toJSON() {
    return this._perfil.toJSON({
      email: this._email,
      telefone: this._telefone,
    });
  };
}

export default Usuario;