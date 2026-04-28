import { Pool, PoolConnection, ResultSetHeader } from "mysql2/promise";

abstract class GenericoDAO<T extends object> {
  protected _conexao: Pool;
  protected _tabela: string;

  constructor(conexao: Pool, tabela: string) {
    this._conexao = conexao;
    this._tabela = tabela;
  }

  public async executarTransacao<R>(
    callback: (conn: PoolConnection) => Promise<R>
  ): Promise<R | null> {
    const conn = await this._conexao.getConnection();
    try {
      await conn.beginTransaction();
      const resultado = await callback(conn);
      await conn.commit();
      return resultado;
    } catch (error) {
      await conn.rollback();
      throw error; 
    } finally {
      conn.release();
    }
  }

  protected async salvar(
    insertSql: string,
    parametros: any[],
    conn?: PoolConnection
  ): Promise<number | null> {
    try {
      const executor = conn ?? this._conexao;
      const [resultado] = await executor.execute<ResultSetHeader>(
        insertSql,
        parametros
      );
      return resultado.insertId || null;
    } catch (error: any) {
      throw new Error(`Erro ao salvar: ${error.message}`);
    }
  }

  protected async atualizar(
    updateSql: string,
    parametros: any[],
    conn?: PoolConnection
  ): Promise<void> {
    try {
      const executor = conn ?? this._conexao;
      const [resultado] = await executor.execute<ResultSetHeader>(
        updateSql,
        parametros
      );
      if (resultado.affectedRows === 0) {
        throw new Error("Nenhum registro foi atualizado.");
      }
    } catch (error: any) {
      throw new Error(`Erro ao atualizar: ${error.message}`);
    }
  }

  protected async buscar<U = T>(
    selectSql: string,
    parametros: any[],
    conn?: PoolConnection
  ): Promise<U | null> {
    try {
      const executor = conn ?? this._conexao;
      const [rows] = await executor.execute(selectSql, parametros);
      const resultados = rows as U[];
      return resultados.length > 0 ? resultados[0] : null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar: ${error.message}`);
    }
  }

  protected async listar<U = T>(
    selectSql: string,
    parametros: any[] = [],
    conn?: PoolConnection
  ): Promise<U[]> {
    try {
      const executor = conn ?? this._conexao;
      const [rows] = await executor.execute(selectSql, parametros);
      return rows as U[];
    } catch (error: any) {
      throw new Error(`Erro ao listar: ${error.message}`);
    }
  }

  protected async deletar(
    deleteSql: string,
    parametros: any[],
    conn?: PoolConnection
  ): Promise<void> {
    try {
      const executor = conn ?? this._conexao;
      const [resultado] = await executor.execute<ResultSetHeader>(
        deleteSql,
        parametros
      );
      if (resultado.affectedRows === 0) {
        throw new Error("Nenhum registro foi deletado.");
      }
    } catch (error: any) {
      throw new Error(`Erro ao deletar: ${error.message}`);
    }
  }
}

export default GenericoDAO;