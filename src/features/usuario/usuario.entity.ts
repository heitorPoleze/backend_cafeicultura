import Pessoa from "../../shared/domain/pessoa/pessoa.entity";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import Credencial from "../auth/auth.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";
import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";

class Usuario  {
  private _email: string;
  private _telefone: string;
  private _tipoUser: "PF" | "PJ";
  private _pessoa: Pessoa;
  private _credencial: Credencial;
  private _documentos?: string[];
  constructor(
    email: string,
    telefone: string,
    senha: string,
    documento: string[],
    nomeExibicao: string,
    idPessoa?: number,
    dataCadastro?: Date,
    endereco?: Endereco
  ){
    this._documentos = documento;
    this._email = email;
    this._telefone = telefone;

    const principalDoc = (documento && documento.length > 0) ? documento[0] : "";
    // Identifica se é PJ pelo formato (presença de '/') ou extensão do documento
    const isCnpj = principalDoc.includes("/") || principalDoc.replace(/\D/g, "").length > 11;
    this._tipoUser = isCnpj ? "PJ" : "PF";
    this._pessoa = isCnpj 
      ? new PessoaJuridica(nomeExibicao, principalDoc, null, dataCadastro, idPessoa, endereco)
      : new PessoaFisica(nomeExibicao, principalDoc, dataCadastro, idPessoa, endereco);
    this._credencial = new Credencial(email, telefone, senha, idPessoa);
  }

  // — Getters abstratos obrigatórios —
  public get endereco(): Endereco | undefined {
    return this._pessoa.endereco;
  }

  public get documentos(): string[] | undefined {
    return this._documentos;
  }

  public get nomeExibicao(): string {
    return this._pessoa.nomeExibicao;
  }
  public get dadosPessoais(): object {
    return {
      idpessoa: this._pessoa.idPessoa,
      dataCadastro: this._pessoa.dataCadastro,
      endereco: this._pessoa.endereco,
      email: this._email,
      telefone: this._telefone,
      documentos: this._documentos
    }
  }
  public get idPessoa(): number | undefined {
    return this._pessoa.idPessoa;
  }

  // — Getters próprios de Usuario —
  
  public get email(): string {
    return this._email;
  }
  public get credencial(): Credencial {
    return this._credencial;
  }
  public get tipoUser(): "PF" | "PJ" {
    return this._tipoUser;
  }

  public get telefone(): string {
    return this._telefone;
  }

  public verificarSenha(senhaInformada: string): Promise<boolean> {
    return this._credencial.compararSenha(senhaInformada);
  }

  // — Serialização —

  public toJSON() {
    return this._pessoa.toJSON({
      email: this._email,
      telefone: this._telefone,
      documentos: this._documentos,
      tipoUser: this._tipoUser,
      // _senha nunca serializada
    });
  }

  public toString(): string {
    return `Usuário: ${this._email} | ${this._pessoa.toString()}`;
  }

}
export default Usuario;