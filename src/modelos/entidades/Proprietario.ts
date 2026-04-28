import Usuario from "./Usuario";
import Pessoa from "./Pessoa";

class Proprietario extends Usuario {
  
  constructor(
    id: number | undefined,
    email: string,
    telefone: string,
    senha: string,
    perfil: Pessoa
  ) {
    super(id, email, telefone, senha, perfil);
  }

  public toJSON(filhos?: object) {
    return super.toJSON({
      tipo_usuario: "Proprietario",
      ...filhos
    });
  }

  public toString(): string {
    return (
      "--- Proprietário ---\n" +
      super.toString()
    );
  }
}

export default Proprietario;