import { Pool, PoolConnection } from "mysql2/promise";
import Pessoa from "../entidades/Pessoa";
import GenericoDAO from "./GenericoDAO";

abstract class PessoaDAO extends GenericoDAO<Pessoa> {
  constructor(conexao: Pool, tabela: string) {
    super(conexao, tabela);
  };

  protected async salvarPessoa(p: Pessoa, conn?: PoolConnection): Promise<number | null> {
    return await super.salvar(
      `INSERT INTO pessoas (data_hora_cadastro) VALUES (?);`,
      [p.data_hora_cadastro],
      conn
    );
  };

  protected async buscarPessoa(id: number): Promise<Pessoa | null> {
    return await super.buscar<Pessoa>(
      `SELECT * FROM pessoas WHERE idPessoa = ?;`,
      [id]
    );
  };
};
export default PessoaDAO;