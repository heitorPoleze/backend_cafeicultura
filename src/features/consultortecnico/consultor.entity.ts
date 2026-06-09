import Usuario from "../usuario/usuario.entity";
import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity"
import { ConsultorResponseDTO } from "./consultor.dto";

class ConsultorTecnico extends Usuario {
  constructor(
    private _authId: number | undefined, 
    private _perfil: PessoaFisica,
    email: string = "",
    telefone: string = "",
    senha: string = ""
  ) {
    super(
      email,
      telefone,
      senha,
      [_perfil.documento], 
      _perfil.nomeExibicao,
      _perfil.idPessoa,
      _perfil.dataCadastro,
      _perfil.endereco
    );
  }

  public get authId(): number | undefined {
    return this._authId;
  };

  public get perfil(): PessoaFisica {
    return this._perfil;
  };

  public toDTO(): ConsultorResponseDTO {
    return {
      id: this._authId,
      nome: this._perfil.nomeExibicao,
      cpf: this._perfil.documento,
      email: this.email,
      telefone: this.telefone,
      dataCadastro: this._perfil.dataCadastro,
    };
  };
}

export default ConsultorTecnico;