import bcrypt from "bcryptjs";

class Credencial {
  constructor(
    private _tipoEntrada: "email" | "cnpj" | "cpf",
    private _entrada: string,
    private _senha: string,
    private _idUsuario?: number
  ) {
    this.validarEntrada(_entrada);
    if (!_senha.startsWith("$2a$") && !_senha.startsWith("$2b$")) {
      this.validarSenhaForte(_senha);
    };
  };

  public get entrada(): string { return this._entrada; }
  public get senha(): string { return this._senha; }
  public get idUsuario(): number | undefined { return this._idUsuario; }

  public async compararSenha(senhaRecebida: string): Promise<boolean> {
    return await bcrypt.compare(senhaRecebida, this._senha);
  };

  private validarEntrada(entrada: string) {
    if (!entrada || entrada.trim() === "") throw new Error("Entrada não pode ser vazio");
    switch (this._tipoEntrada) {
      case "email":
        if (!/^[a-zA-Záéíóúãõàèùâêô0-9._%+-]+@[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})?$/.test(entrada)) {
          throw new Error("Email inválido");
        };
        break;
      case "cnpj":
        if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(entrada)) {
          throw new Error("CNPJ inválido");
        };
        break;
      case "cpf":
        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(entrada)) {
          throw new Error("CPF inválido");
        };
        break;
    };
  };

  private validarSenhaForte(senha: string) {
    if (!senha) throw new Error("Senha não pode ser vazia!");
    if (senha.length < 8) throw new Error("Senha deve conter pelo menos 8 caracteres!");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/.test(senha)) {
      throw new Error("Senha deve conter maiúscula, minúscula, número e símbolo.");
    };
  };
}

export default Credencial;