import Pessoa from "../../shared/domain/pessoa.entity";
import PessoaFisica from "../../shared/domain/pessoafisica.entity";
import { ProprietarioResponseDTO } from "./proprietario.dto";

class Proprietario {
  constructor(
    private _authId: number | undefined,
    private _perfil: Pessoa // Aceita qualquer classe que estenda Pessoa
  ) {}

  public get authId(): number | undefined { return this._authId; }
  public get perfil(): Pessoa { return this._perfil; }

  public toDTO(email: string, telefone: string): ProprietarioResponseDTO {
    return {
      id: this._authId!,
      tipoPessoa: this._perfil instanceof PessoaFisica ? "fisica" : "juridica",
      nomeOuRazao: this._perfil.nomeExibicao,
      documento: this._perfil.documento,
      email: email,
      telefone: telefone,
      inscrEstadual: (this._perfil as any).inscricaoEstadual,
      dataCadastro: this._perfil.dataCadastro
    };
  };
}

export default Proprietario;