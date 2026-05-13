import PessoaFisica from "../../shared/domain/pessoafisica.entity";
import { ConsultorResponseDTO } from "./consultor.dto";

class ConsultorTecnico {
  constructor(
    private _authId: number | undefined, 
    private _perfil: PessoaFisica
  ) {}

  public get authId(): number | undefined {
    return this._authId;
  };

  public get perfil(): PessoaFisica {
    return this._perfil;
  };

  // Método para "Apresentação": A Entidade decide como se exportar para o DTO
  public toDTO(email: string, telefone: string): ConsultorResponseDTO {
    return {
      id: this._authId,
      nome: this._perfil.nomeExibicao,
      cpf: this._perfil.documento,
      email: email,
      telefone: telefone,
      dataCadastro: this._perfil.dataCadastro,
    };
  };
}

export default ConsultorTecnico;