import bcrypt from "bcryptjs";
import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";

class Usuario {
  private _email: string;
  private _telefone: string;
  private _senha: string;
  private _perfil: PessoaFisica | PessoaJuridica;

  constructor(
    email: string,
    telefone: string,
    senha: string,
    perfil: PessoaFisica | PessoaJuridica,
  ){
    this._email = email;
    this._telefone = telefone;
    this._senha = senha;
    this._perfil = perfil;
  };
  

  get perfil(): PessoaFisica | PessoaJuridica {
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
    const salt = await bcrypt.genSalt(12);
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