import { Pool } from "mysql2/promise";
import Proprietario from "../entidades/Proprietario";
import PessoaFisica from "../entidades/PessoaFisica";
import PessoaJuridica from "../entidades/PessoaJuridica";
import ProprietarioDAO from "../dao/ProprietarioDAO";
import UsuarioServico from "./UsuarioServico";

class ProprietarioServico extends UsuarioServico {
  private _proprietarioDAO: ProprietarioDAO;

  constructor(conexao: Pool) {
    super(conexao);
    this._proprietarioDAO = new ProprietarioDAO(conexao);
  }

  public async cadastrarFisica(
    email: string,
    telefone: string,
    senha: string,
    nome: string,
    cpf: string,
  ): Promise<number> {
    const perfil = new PessoaFisica(undefined, nome, cpf);
    const proprietario = new Proprietario(undefined, email, telefone, senha, perfil);
    
    const id = await this._proprietarioDAO.salvarProprietario(proprietario);
    if (!id) throw new Error("ERRO_CADASTRAR_PROPRIETARIO_FISICA");
    return id;
  }

  public async cadastrarJuridica(
    email: string,
    telefone: string,
    senha: string,
    razaoSocial: string,
    cnpj: string,
    inscrEstadual: string
  ): Promise<number> {
    const perfil = new PessoaJuridica(undefined, razaoSocial, cnpj, inscrEstadual);
    const proprietario = new Proprietario(undefined, email, telefone, senha, perfil);
    
    const id = await this._proprietarioDAO.salvarProprietario(proprietario);
    if (!id) throw new Error("ERRO_CADASTRAR_PROPRIETARIO_JURIDICA");
    return id;
  }

  public async buscarPorId(id: number): Promise<Proprietario> {
    const proprietario = await this._proprietarioDAO.buscarPorId(id);
    if (!proprietario) throw new Error("PROPRIETARIO_NAO_ENCONTRADO");
    return proprietario;
  }

  public async buscarPorCpf(cpf: string): Promise<Proprietario | null> {
    return await this._proprietarioDAO.buscarPorCpf(cpf);
  }

  public async buscarPorCnpj(cnpj: string): Promise<Proprietario | null> {
    return await this._proprietarioDAO.buscarPorCnpj(cnpj);
  }
}

export default ProprietarioServico;