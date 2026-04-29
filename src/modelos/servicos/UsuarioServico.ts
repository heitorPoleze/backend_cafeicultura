import UsuarioDAO from "../dao/UsuarioDAO";
import Usuario from "../entidades/Usuario";
import Pessoa from "../entidades/Pessoa";
import { Pool } from "mysql2/promise";

class UsuarioServico {
  protected _usuarioDAO: UsuarioDAO;

  constructor(conexao: Pool) {
    this._usuarioDAO = new UsuarioDAO(conexao);
  }

  public async autenticar(entrada: string, senha: string, tipoEntrada: string): Promise<Usuario<Pessoa>> {
    try {
      return await this._usuarioDAO.autenticarUsuario(entrada, senha, tipoEntrada);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };
}

export default UsuarioServico;