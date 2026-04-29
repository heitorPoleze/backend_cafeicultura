import { Pool, RowDataPacket } from "mysql2/promise";
import Proprietario from "../entidades/Proprietario";
import UsuarioDAO from "./UsuarioDAO";
import PessoaFisica from "../entidades/PessoaFisica";
import PessoaJuridica from "../entidades/PessoaJuridica";

class ProprietarioDAO extends UsuarioDAO {
  constructor(conexao: Pool) {
    super(conexao);
  }

  public async salvarProprietario(u: Proprietario): Promise<number | null> {
    return await super.executarTransacao(async (conn) => {
      const idPessoa_PK = await super.salvarUsuario(u, conn);
      if (!idPessoa_PK) return null;

      if (u.perfil instanceof PessoaFisica) {
        await super.salvar(
          `INSERT INTO pessoasfisicas (idPeFisica_PFK, nome, cpf) VALUES (?, ?, ?);`,
          [idPessoa_PK, u.perfil.nome, u.perfil.cpf],
          conn,
        );
      } else if (u.perfil instanceof PessoaJuridica) {
        await super.salvar(
          `INSERT INTO pessoasjuridicas (idPeJuridica_PFK, razaoSocial, cnpj, inscEstadual) VALUES (?, ?, ?, ?);`,
          [
            idPessoa_PK,
            u.perfil.razaoSocial,
            u.perfil.cnpj,
            u.perfil.inscricaoEstadual || null,
          ],
          conn,
        );
      } else {
        throw new Error("Perfil do proprietário é inválido.");
      }
      await super.salvar(
        `INSERT INTO proprietarios (idProprietario_PFK) VALUES (?);`,
        [idPessoa_PK],
        conn,
      );

      return idPessoa_PK;
    });
  }

  private async criarProprietario(
    sql: string,
    parametros: any[],
    buscaUnica: true,
  ): Promise<Proprietario | null>;
  private async criarProprietario(
    sql: string,
    parametros?: any[],
    buscaUnica?: false,
  ): Promise<Proprietario[]>;
  private async criarProprietario(
    sql: string,
    parametros?: any[],
    buscaUnica: boolean = false,
  ): Promise<Proprietario | Proprietario[] | null> {
    const rows = buscaUnica
      ? [await super.buscar<RowDataPacket>(sql, parametros!)].filter(Boolean)
      : await super.listar<RowDataPacket>(sql, parametros);

    const proprietarios: Proprietario[] = [];

    for (const row of rows) {
      if (!row) continue;

      let perfilPessoa: PessoaFisica | PessoaJuridica;

      if (row.cpf) {
        perfilPessoa = new PessoaFisica(
          row.idProprietario_PFK,
          row.nome,
          row.cpf,
        );
      } else if (row.cnpj) {
        perfilPessoa = new PessoaJuridica(
          row.idProprietario_PFK,
          row.razaoSocial,
          row.cnpj,
          row.inscEstadual || null,
        );
      } else {
        throw new Error(
          "Integridade de dados comprometida: Proprietário sem CPF ou CNPJ no banco de dados.",
        );
      }

      const proprietario = new Proprietario(
        row.idProprietario_PFK,
        row.email,
        row.telefone,
        row.senha,
        perfilPessoa,
      );

      proprietarios.push(proprietario);
    }

    return buscaUnica
      ? (proprietarios[0] ?? null)
      : proprietarios.length > 0
        ? proprietarios
        : null;
  }

  public async buscarPorId(id: number): Promise<Proprietario | null> {
    return await this.criarProprietario(
      `SELECT
        p.idProprietario_PFK as idProprietario_PFK,
        p.dataCadastro as dataCadastro,
        pf.nome as nome,
        pf.cpf as cpf,
        pj.razaoSocial as razaoSocial,
        pj.cnpj as cnpj,
        pj.inscEstadual as inscEstadual,
        u.email as email,
        u.telefone as telefone,
        u.senha as senha
        FROM proprietarios prop
        JOIN pessoas p ON prop.idProprietario_PFK = p.idPessoa_PK
        LEFT JOIN pessoasfisicas pf ON p.idPessoa_PK = pf.idPeFisica_PFK
        LEFT JOIN pessoasjuridicas pj ON p.idPessoa_PK = pj.idPeJuridica_PFK
        JOIN usuarios u ON p.idPessoa_PK = u.idUsuario_PFK
        WHERE prop.idProprietario_PFK = ?;`,
      [id],
      true,
    );
  }

  public async buscarPorCnpj(cnpj: string): Promise<Proprietario | null> {
    return await this.criarProprietario(
      `SELECT
        p.idProprietario_PFK,
        p.dataCadastro as dataCadastro,
        pj.razaoSocial as razaoSocial,
        pj.cnpj as cnpj,
        pj.inscEstadual as inscEstadual,
        u.email as email,
        u.telefone as telefone,
        u.senha as senha
        FROM proprietarios prop
        JOIN pessoas p ON prop.idProprietario_PFK = p.idPessoa_PK
        LEFT JOIN pessoasjuridicas pj ON p.idPessoa_PK = pj.idPeJuridica_PFK
        JOIN usuarios u ON p.idPessoa_PK = u.idUsuario_PFK
        WHERE pj.cnpj = ?;`,
      [cnpj],
      true,
    );
  }

  public async buscarPorCpf(cpf: string): Promise<Proprietario | null> {
    return await this.criarProprietario(
      `SELECT
          p.idProprietario_PFK,
          p.dataCadastro as dataCadastro,
          pf.nome as nome,
          pf.cpf as cpf,
          FROM proprietarios prop
          JOIN pessoas p ON prop.idProprietario_PFK = p.idPessoa_PK
          LEFT JOIN pessoasfisicas pf ON p.idPessoa_PK = pf.idPeFisica_PFK
          JOIN usuarios u ON p.idPessoa_PK = u.idUsuario_PFK
          WHERE pf.cpf = ?;`,
      [cpf],
      true,
    );
  }
}
export default ProprietarioDAO;
