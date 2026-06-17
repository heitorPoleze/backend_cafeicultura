import Usuario from "../usuario/usuario.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";

class Proprietario extends Usuario {
  constructor(
    perfil: Pessoa,
    email: string,
    telefone: string,
    senha: string
  ) {
    super(
      email,
      telefone,
      senha,
      perfil
    );
  };
}

export default Proprietario;