import { Pool } from "mysql2/promise";
import ConsultorTecnico from "../entidades/ConsultorTecnico";
import PessoaFisica from "../entidades/PessoaFisica";
import ConsultorTecnicoDAO from "../dao/ConsultorTecnicoDAO";
import UsuarioServico from "./UsuarioServico";

class ConsultorTecnicoServico extends UsuarioServico {
  private _consultorDAO: ConsultorTecnicoDAO;

  constructor(conexao: Pool) {
    super(conexao);
    this._consultorDAO = new ConsultorTecnicoDAO(conexao);
  }

  public async cadastrar(
    email: string,
    telefone: string,
    senha: string,
    nome: string,
    cpf: string,
  ): Promise<number> {
    const perfil = new PessoaFisica(undefined, nome, cpf);
    const consultor = new ConsultorTecnico(undefined, email, telefone, senha, perfil);
    
    const id = await this._consultorDAO.salvarConsultor(consultor);
    if (!id) throw new Error("ERRO_CADASTRAR_CONSULTOR_TECNICO");
    return id;
  }

  public async buscarPorId(id: number): Promise<ConsultorTecnico> {
    const consultor = await this._consultorDAO.buscarPorId(id);
    if (!consultor) throw new Error("CONSULTOR_TECNICO_NAO_ENCONTRADO");
    return consultor;
  }

  public async buscarPorCpf(cpf: string): Promise<ConsultorTecnico | null> {
    return await this._consultorDAO.buscarPorCpf(cpf);
  }
}

export default ConsultorTecnicoServico;