import { Pool, PoolConnection } from "mysql2/promise";
import Pessoa from "../entidades/Pessoa";
import GenericoDAO from "./GenericoDAO";

abstract class PessoaDAO extends GenericoDAO<Pessoa> {
  constructor(conexao: Pool, tabela: string) {
    super(conexao, tabela);
  };

  protected async salvarPessoa(p: Pessoa, conn?: PoolConnection): Promise<number | null> {
    return await super.salvar(
      `INSERT INTO pessoas (dataCadastro) VALUES (?);`,
      [p.dataCadastro],
      conn
    );
  };
};
export default PessoaDAO;