import { Pool, RowDataPacket } from "mysql2/promise";
import ConsultorTecnico from "../entidades/ConsultorTecnico";
import UsuarioDAO from "./UsuarioDAO";
import PessoaFisica from "../entidades/PessoaFisica";

class ConsultorTecnicoDAO extends UsuarioDAO {
  constructor(conexao: Pool) {
    super(conexao);
  }

  public async salvarConsultor(u: ConsultorTecnico): Promise<number | null> {
    return await super.executarTransacao(async (conn) => {
      const idPessoa_PK = await super.salvarUsuario(u, conn);
      if (!idPessoa_PK) return null;

      await super.salvar(
        `INSERT INTO pessoasfisicas (idPeFisica_PFK, nome, cpf) VALUES (?, ?, ?);`,
        [idPessoa_PK, u.perfil.nome, u.perfil.cpf],
        conn
      );

      await super.salvar(
        `INSERT INTO consultoresTecnicos (idConsultor_PFK) VALUES (?);`,
        [idPessoa_PK],
        conn
      );

      return idPessoa_PK;
    });
  }

  private async criarConsultor(
    sql: string,
    parametros: any[],
    buscaUnica: true
  ): Promise<ConsultorTecnico | null>;
  private async criarConsultor(
    sql: string,
    parametros?: any[],
    buscaUnica?: false
  ): Promise<ConsultorTecnico[]>;
  private async criarConsultor(
    sql: string,
    parametros?: any[],
    buscaUnica: boolean = false
  ): Promise<ConsultorTecnico | ConsultorTecnico[] | null> {
    const rows = buscaUnica
      ? [await super.buscar<RowDataPacket>(sql, parametros!)].filter(Boolean)
      : await super.listar<RowDataPacket>(sql, parametros);

    const consultores: ConsultorTecnico[] = [];

    for (const row of rows) {
      if (!row) continue;

      const perfilPessoa = new PessoaFisica(
        row.idConsultor_PFK,
        row.nome,
        row.cpf
      );
      perfilPessoa.dataCadastro = row.dataCadastro;

      const consultor = new ConsultorTecnico(
        row.idConsultor_PFK,
        row.email,
        row.telefone,
        row.senha,
        perfilPessoa
      );

      consultores.push(consultor);
    }

    return buscaUnica
      ? consultores[0] ?? null
      : consultores.length > 0
      ? consultores
      : null;
  }

  public async buscarPorId(id: number): Promise<ConsultorTecnico | null> {
    return await this.criarConsultor(
      `SELECT
        ct.idConsultor_PFK as idConsultor_PFK,
        p.dataCadastro as dataCadastro,
        pf.nome as nome,
        pf.cpf as cpf,
        u.email as email,
        u.telefone as telefone,
        u.senha as senha
        FROM consultoresTecnicos ct
        JOIN pessoas p ON ct.idConsultor_PFK = p.idPessoa_PK
        JOIN pessoasfisicas pf ON p.idPessoa_PK = pf.idPeFisica_PFK
        JOIN usuarios u ON p.idPessoa_PK = u.idUsuario_PFK
        WHERE ct.idConsultor_PFK = ?;`,
      [id],
      true
    );
  }

  public async buscarPorCpf(cpf: string): Promise<ConsultorTecnico | null> {
    return await this.criarConsultor(
      `SELECT
        ct.idConsultor_PFK as idConsultor_PFK,
        p.dataCadastro as dataCadastro,
        pf.nome as nome,
        pf.cpf as cpf,
        u.email as email,
        u.telefone as telefone,
        u.senha as senha
        FROM consultoresTecnicos ct
        JOIN pessoas p ON ct.idConsultor_PFK = p.idPessoa_PK
        JOIN pessoasfisicas pf ON p.idPessoa_PK = pf.idPeFisica_PFK
        JOIN usuarios u ON p.idPessoa_PK = u.idUsuario_PFK
        WHERE pf.cpf = ?;`,
      [cpf],
      true
    );
  }

  public async buscarPorCnpj(cnpj: string): Promise<ConsultorTecnico | null> {
    return null;
  }
}

export default ConsultorTecnicoDAO;