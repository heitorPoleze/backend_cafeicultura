import bcrypt from "bcryptjs";

class Credencial {
  constructor(
    private _email: string,
    private _telefone: string,
    private _senha: string,
    private _idUsuario?: number
  ) {
    this.validarEmail(_email);
    this.validarTelefone(_telefone);
    // A senha pode vir já em hash do banco, então só validamos se não estiver "hasheada"
    if (!_senha.startsWith("$2a$") && !_senha.startsWith("$2b$")) {
      this.validarSenhaForte(_senha);
    }
  }

  // --- Getters ---
  public get email(): string { return this._email; }
  public get telefone(): string { return this._telefone; }
  public get senha(): string { return this._senha; }
  public get idUsuario(): number | undefined { return this._idUsuario; }

  // --- Comportamentos ---
  public async criptografarSenha(): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this._senha = await bcrypt.hash(this._senha, salt);
  }

  public async compararSenha(senhaRecebida: string): Promise<boolean> {
    return await bcrypt.compare(senhaRecebida, this._senha);
  }

  // --- Validações (Blindagem do Modelo) ---
  private validarEmail(email: string) {
    if (!email || email.trim() === "") throw new Error("Email não pode ser vazio");
    if (!/^[a-zA-Záéíóúãõàèùâêô0-9._%+-]+@[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})?$/.test(email)) {
      throw new Error("Email inválido");
    }
  }

  private validarTelefone(telefone: string) {
    if (!telefone || telefone.trim() === "") throw new Error("Telefone não pode ser vazio");
    if (!/^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/.test(telefone)) throw new Error("Telefone inválido");
  }

  private validarSenhaForte(senha: string) {
    if (!senha) throw new Error("Senha não pode ser vazia!");
    if (senha.length < 8) throw new Error("Senha deve conter pelo menos 8 caracteres!");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/.test(senha)) {
      throw new Error("Senha deve conter maiúscula, minúscula, número e símbolo.");
    }
  }
}

export default Credencial;