import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";
import Usuario from "../usuario/usuario.entity";

class Proprietario extends Usuario {
  constructor(
    perfil: PessoaFisica | PessoaJuridica,
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