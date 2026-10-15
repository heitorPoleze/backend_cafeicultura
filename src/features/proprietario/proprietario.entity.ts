import PessoaBase from "../../shared/domain/pessoa/pessoabase.entity";
import Usuario from "../usuario/usuario.entity";

class Proprietario extends Usuario {
  constructor(
    perfil: PessoaBase,
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
};

export default Proprietario;