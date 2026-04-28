import Usuario from "./Usuario";
import Pessoa from "./Pessoa";

class ConsultorTecnico extends Usuario {
  
  constructor(
    id: number | undefined,
    email: string,
    telefone: string,
    senha: string,
    perfil: Pessoa
  ) {
    // Calls the constructor of the parent class (Usuario)
    super(id, email, telefone, senha, perfil);
  }

  public toJSON(filhos?: object) {
    return super.toJSON({
      tipo_usuario: "Consultor Tecnico",
      ...filhos
    });
  }

  public toString(): string {
    return (
      "--- Consultor Técnico ---\n" +
      super.toString()
    );
  }
}

export default ConsultorTecnico;