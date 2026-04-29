import { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import Usuario from "../entidades/Usuario";
import PessoaDAO from "./PessoaDAO";
import Pessoa from "../entidades/Pessoa";
import PessoaFisica from "../entidades/PessoaFisica";
import PessoaJuridica from "../entidades/PessoaJuridica";

class UsuarioDAO extends PessoaDAO {
  constructor(conexao: Pool) {
    super(conexao, "usuarios");
  }

  protected async salvarUsuario(
    u: Usuario<Pessoa>,
    conn?: PoolConnection,
  ): Promise<number | null> {
    const idPessoa = await super.salvarPessoa(u.perfil, conn);
    if (!idPessoa) return null;
    await u.criptografarSenha();
    await super.salvar(
      `INSERT INTO ${this._tabela} 
              (idUsuario_PFK, email, telefone, senha) 
              VALUES (?,?,?,?);`,
      [idPessoa, u.email, u.telefone, u.senha],
      conn,
    );
    
    return idPessoa;
  }

  public async autenticarUsuario(
    entrada: string,
    senha: string,
    tipoEntrada: string,
  ): Promise<Usuario<Pessoa>> {
    let usuario: Usuario<Pessoa> | null = null;

    if (tipoEntrada === "email") {
      usuario = await this.buscarPorEmail(entrada);
    } else if (tipoEntrada === "cpf") {
      usuario = await this.buscarPorCpf(entrada);
    } else if (tipoEntrada === "cnpj") {
      usuario = await this.buscarPorCnpj(entrada);
    }

    if (!usuario) {
      throw new Error("ERRO_USUARIO_NAO_ENCONTRADO");
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      throw new Error("ERRO_SENHA_INCORRETA");
    }

    return usuario;
  }

  private async criarUsuario(
    sql: string,
    parametros: any[],
    buscaUnica: true,
  ): Promise<Usuario<Pessoa> | null>;
  private async criarUsuario(
    sql: string,
    parametros?: any[],
    buscaUnica?: false,
  ): Promise<Usuario<Pessoa>[]>;
  private async criarUsuario(
    sql: string,
    parametros?: any[],
    buscaUnica: boolean = false,
  ): Promise<Usuario<Pessoa> | Usuario<Pessoa>[] | null> {
    const rows = buscaUnica
      ? [await super.buscar<RowDataPacket>(sql, parametros!)].filter(Boolean)
      : await super.listar<RowDataPacket>(sql, parametros);

    const usuarios: Usuario<Pessoa>[] = [];

    for (const row of rows) {
      if (!row) continue;

      let perfilPessoa: PessoaFisica | PessoaJuridica;

      if (row.cpf) {
        perfilPessoa = new PessoaFisica(
          row.idUsuario_PFK,
          row.nome,
          row.cpf,
        );
      } else if (row.cnpj) {
        perfilPessoa = new PessoaJuridica(
          row.idUsuario_PFK,
          row.razaoSocial,
          row.cnpj,
          row.inscEstadual,
        );
      } else {
        throw new Error(
          "Integridade de dados comprometida: Usuário sem CPF ou CNPJ no banco de dados.",
        );
      }

      perfilPessoa.dataCadastro = row.dataCadastro;

      const usuario = new Usuario(
        row.idUsuario_PFK,
        row.email,
        row.telefone,
        row.senha,
        perfilPessoa,
      );
      usuarios.push(usuario);
    }
    return buscaUnica
      ? (usuarios[0] ?? null)
      : usuarios.length > 0
        ? usuarios
        : null;
  }

  protected async buscarPorEmail(
    email: string,
  ): Promise<Usuario<Pessoa> | null> {
    return await this.criarUsuario(
      `SELECT 
        u.idUsuario_PFK as idUsuario_PFK, 
        u.email as email, 
        u.telefone as telefone, 
        u.senha as senha,
        pf.nome as nome, 
        pf.cpf as cpf, 
        pj.razaoSocial as razaoSocial, 
        pj.cnpj as cnpj, 
        pj.inscEstadual as inscEstadual
        FROM ${this._tabela} u
        LEFT JOIN pessoasfisicas pf ON u.idUsuario_PFK = pf.idPeFisica_PFK
        LEFT JOIN pessoasjuridicas pj ON u.idUsuario_PFK = pj.idPeJuridica_PFK
        WHERE u.email = ? LIMIT 1;`,
      [email],
      true,
    );
  }

  protected async buscarPorId(id: number): Promise<Usuario<Pessoa> | null> {
    return await this.criarUsuario(
      `SELECT 
        u.idUsuario_PFK as idUsuario_PFK, 
        u.email as email, 
        u.telefone as telefone, 
        u.senha as senha,
        pf.nome as nome, 
        pf.cpf as cpf, 
        pj.razaoSocial as razaoSocial, 
        pj.cnpj as cnpj, 
        pj.inscEstadual as inscEstadual
        FROM ${this._tabela} u
        LEFT JOIN pessoasfisicas pf ON u.idUsuario_PFK = pf.idPeFisica_PFK
        LEFT JOIN pessoasjuridicas pj ON u.idUsuario_PFK = pj.idPeJuridica_PFK
        WHERE u.idUsuario_PFK = ? LIMIT 1;`,
      [id],
      true,
    );
  }

  protected async buscarPorCpf(cpf: string): Promise<Usuario<Pessoa> | null> {
    return await this.criarUsuario(
      `SELECT 
       u.idUsuario_PFK as idUsuario_PFK, 
       u.email as email, 
       u.telefone as telefone, 
       u.senha as senha,
       pf.nome as nome, 
       pf.cpf as cpf,
       p.dataCadastro as dataCadastro
       FROM ${this._tabela} u
       JOIN pessoas p ON u.idUsuario_PFK = p.idPessoa_PK
       JOIN pessoasfisicas pf ON u.idUsuario_PFK = pf.idPeFisica_PFK
       WHERE pf.cpf = ? LIMIT 1;`,
      [cpf],
      true,
    );
  }

  protected async buscarPorCnpj(cnpj: string): Promise<Usuario<Pessoa> | null> {
    return await this.criarUsuario(
      `SELECT 
       u.idUsuario_PFK as idUsuario_PFK, 
       u.email as email, 
       u.telefone as telefone, 
       u.senha as senha,
       pj.razaoSocial as razaoSocial, 
       pj.cnpj as cnpj, 
       pj.inscEstadual as inscEstadual,
       p.dataCadastro as dataCadastro
       FROM ${this._tabela} u
       JOIN pessoas p ON u.idUsuario_PFK = p.idPessoa_PK
       JOIN pessoasjuridicas pj ON u.idUsuario_PFK = pj.idPeJuridica_PFK
       WHERE pj.cnpj = ? LIMIT 1;`,
      [cnpj],
      true,
    );
  }
}

export default UsuarioDAO;
