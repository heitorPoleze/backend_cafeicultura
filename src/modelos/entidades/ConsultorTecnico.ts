import Usuario from "./Usuario";
import Pessoa from "./Pessoa";
import PessoaFisica from "./PessoaFisica";

class ConsultorTecnico extends Usuario<PessoaFisica> {
  
  constructor(
    id: number | undefined,
    email: string,
    telefone: string,
    senha: string,
    perfil: PessoaFisica
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