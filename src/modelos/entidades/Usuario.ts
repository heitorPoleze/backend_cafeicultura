import bcrypt from "bcryptjs";
import Pessoa from "./Pessoa";

class Usuario {
  private _id: number | undefined;
  private _email: string;
  private _telefone: string;
  private _senha: string;
  private _perfil: Pessoa; // Composition: Holds the physical or legal identity

  constructor(
    id: number | undefined,
    email: string,
    telefone: string,
    senha: string,
    perfil: Pessoa,
  ) {
    if (id && id <= 0)
      throw new Error("ID do usuário deve ser maior que zero!");
    this._id = id;

    if (email && email == "") throw new Error("Email não pode ser vazio");
    if (
      email &&
      !email.match(
        /^[a-zA-Záéíóúãõàèùâêô0-9._%+-]+@[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})?$/,
      )
    )
      throw new Error("Email inválido");
    this._email = email;

    if (telefone && telefone == "")
      throw new Error("Telefone não pode ser vazio");
    if (telefone && !telefone.match(/^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/))
      throw new Error("Telefone inválido");
    this._telefone = telefone;

    if (senha == "") throw new Error("Senha não pode ser vazia!");
    if (senha.length < 8)
      throw new Error("Senha deve conter pelo menos 8 caracteres!");
    if (
      !senha.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
      )
    ) {
      throw new Error(
        "Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um símbolo.",
      );
    }
    this._senha = senha;

    if (!perfil) throw new Error("Usuário deve estar vinculado a uma Pessoa!");
    this._perfil = perfil;
  }

  public get id(): number | undefined {
    return this._id;
  }

  public get email(): string | undefined {
    return this._email;
  }

  public set email(novo_valor: string) {
    if (novo_valor == "") throw new Error("Email não pode ser vazio");
    if (
      !novo_valor.match(
        /^[a-zA-Záéíóúãõàèùâêô0-9._%+-]+@[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})?$/,
      )
    ) {
      throw new Error("Email inválido");
    }
    this._email = novo_valor;
  }

  public get telefone(): string | undefined {
    return this._telefone;
  }

  public set telefone(novo_valor: string) {
    if (novo_valor == "") throw new Error("Telefone não pode ser vazio");
    if (!novo_valor.match(/^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/))
      throw new Error("Telefone inválido");
    this._telefone = novo_valor;
  }

  public get senha(): string {
    return this._senha;
  }

  public get perfil(): Pessoa {
    return this._perfil;
  }

  public set perfil(novo_valor: Pessoa) {
    if (!novo_valor)
      throw new Error("Usuário deve estar vinculado a uma Pessoa!");
    this._perfil = novo_valor;
  }

  public async criptografarSenha(): Promise<void> {
    const salt = await bcrypt.genSalt(); // Gera um "salt" de 10 rounds
    this._senha = await bcrypt.hash(this._senha, salt); // Criptografa a senha
  }

  public async compararSenha(senhaRecebida: string): Promise<boolean> {
    // Compara a senha recebida com a criptografada
    return await bcrypt.compare(senhaRecebida, this._senha);
  }

  public toJSON(filhos?: object) {
    return {
      idUsuario: this._id,
      email: this._email,
      telefone: this._telefone,
      perfil: this._perfil.toJSON(),
      ...filhos,
    };
  }

  public toString(): string {
    return (
      "Email: " +
      this._email +
      "\n" +
      "Telefone: " +
      this._telefone +
      "\n" +
      "Perfil Vinculado:\n" +
      this._perfil.toString()
    );
  }
}

export default Usuario;
