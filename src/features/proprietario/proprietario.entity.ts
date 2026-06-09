import Usuario from "../usuario/usuario.entity";
import Pessoa from "../../shared/domain/pessoa/pessoa.entity";
import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";

class Proprietario extends Usuario {
  constructor(
    private _perfil: Pessoa,
    email: string,
    telefone: string,
    senha: string
  ) {
    super(
      email,
      telefone,
      senha,
      _perfil.documentos || [],
      _perfil.nomeExibicao,
      _perfil.idPessoa,
      _perfil.dataCadastro,
      _perfil.endereco
    );
  }

  public get perfil(): Pessoa {
    return this._perfil;
  }

  public get tipoUser(): "PF" | "PJ" {
    return this._perfil instanceof PessoaFisica ? "PF" : "PJ";
  }
}

export default Proprietario;