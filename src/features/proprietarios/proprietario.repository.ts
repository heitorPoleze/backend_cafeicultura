import { Pool, ResultSetHeader } from "mysql2/promise";
import Proprietario from "./proprietario.entity";
import Credencial from "../auth/auth.entity";
import AuthRepository from "../auth/auth.repository";
import PessoaFisica from "../../shared/domain/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoajuridica.entity";
import IProprietarioRow from "./proprietario.model";

class ProprietarioRepository {
  constructor(private db: Pool, private authRepo: AuthRepository) {}

  public async salvarComTransacao(prop: Proprietario, cred: Credencial): Promise<number> {
    const conn = await this.db.getConnection();
    try {
      await conn.beginTransaction();

      const [res] = await conn.execute<ResultSetHeader>(
        `INSERT INTO pessoas (dataCadastro) VALUES (?);`, [prop.perfil.dataCadastro]
      );
      const id = res.insertId;

      if (prop.perfil instanceof PessoaFisica) {
        await conn.execute(
          `INSERT INTO pessoasfisicas (idPeFisica_PFK, nome, cpf) VALUES (?, ?, ?);`,
          [id, prop.perfil.nomeExibicao, prop.perfil.documento]
        );
      } else {
        const pj = prop.perfil as PessoaJuridica;
        await conn.execute(
          `INSERT INTO pessoasjuridicas (idPeJuridica_PFK, razaoSocial, cnpj, inscEstadual) VALUES (?, ?, ?, ?);`,
          [id, pj.nomeExibicao, pj.documento, pj.inscricaoEstadual || null]
        );
      };

      await conn.execute(`INSERT INTO proprietarios (idProprietario_PFK) VALUES (?);`, [id]);
      await this.authRepo.salvarCredencial(cred, id, conn);

      await conn.commit();
      return id;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    };
  };

  public async buscarPorId(id: number): Promise<{ prop: Proprietario, email: string, telefone: string } | null> {
    const sql = `
      SELECT u.email, u.telefone, p.dataCadastro, prop.idProprietario_PFK,
             pf.nome, pf.cpf, pj.razaoSocial, pj.cnpj, pj.inscrEstadual
      FROM proprietarios prop
      JOIN pessoas p ON prop.idProprietario_PFK = p.idPessoa_PK
      JOIN usuarios u ON p.idPessoa_PK = u.idUsuario_PFK
      LEFT JOIN pessoasfisicas pf ON p.idPessoa_PK = pf.idPeFisica_PFK
      LEFT JOIN pessoasjuridicas pj ON p.idPessoa_PK = pj.idPeJuridica_PFK
      WHERE prop.idProprietario_PFK = ?;
    `;
    const [rows] = await this.db.execute<IProprietarioRow[]>(sql, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const perfil = row.cpf 
      ? new PessoaFisica(row.nome!, row.cpf, row.dataCadastro)
      : new PessoaJuridica(row.razaoSocial!, row.cnpj!, row.inscEstadual, row.dataCadastro);

    return { prop: new Proprietario(row.idProprietario_PFK, perfil), email: row.email, telefone: row.telefone };
  };
}

export default ProprietarioRepository;