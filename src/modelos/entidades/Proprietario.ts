import Usuario from "./Usuario";
import Pessoa from "./Pessoa";
import PessoaFisica from "./PessoaFisica";
import PessoaJuridica from "./PessoaJuridica";

class Proprietario extends Usuario<PessoaFisica | PessoaJuridica> {
  
  constructor(
    id: number | undefined,
    email: string,
    telefone: string,
    senha: string,
    perfil: PessoaFisica | PessoaJuridica
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