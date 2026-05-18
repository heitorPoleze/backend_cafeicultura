import { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import Credencial from "./auth.entity";
import { IAuthRow } from "./auth.model";

class AuthRepository {
  constructor(private db: Pool) {}

  // Este método é chamado POR OUTROS repositórios (Proprietário ou Consultor)
  // passando a conexão da transação aberta.
  public async salvarCredencial(credencial: Credencial, idUsuarioRef: number, conn: PoolConnection): Promise<void> {
    await conn.execute(
      `INSERT INTO usuarios (idUsuario_PFK, email, telefone, senha) VALUES (?, ?, ?, ?);`,
      [idUsuarioRef, credencial.email, credencial.telefone, credencial.senha]
    );
  };

  // Busca Inteligente para Login: Traz a credencial e o Nome para a Sessão
  public async buscarParaLogin(
    entrada: string, 
    tipo: "email" | "cpf" | "cnpj"
  ): Promise<{ credencial: Credencial, nomeSessao: string } | null> {
    
    let whereClause = "";
    if (tipo === "email") whereClause = "u.email = ?";
    else if (tipo === "cpf") whereClause = "pf.cpf = ?";
    else if (tipo === "cnpj") whereClause = "pj.cnpj = ?";

    const sql = `
      SELECT 
        u.idUsuario_PFK, u.email, u.telefone, u.senha,
        COALESCE(pf.nome, pj.razaoSocial) as nomeExibicao
      FROM usuarios u
      JOIN pessoas p ON u.idUsuario_PFK = p.idPessoa_PK
      LEFT JOIN pessoasfisicas pf ON p.idPessoa_PK = pf.idPeFisica_PFK
      LEFT JOIN pessoasjuridicas pj ON p.idPessoa_PK = pj.idPeJuridica_PFK
      WHERE ${whereClause} LIMIT 1;
    `;

    const [rows] = await this.db.execute<IAuthRow[]>(sql, [entrada]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const credencial = new Credencial(row.email, row.telefone, row.senha, row.idUsuario_PFK);

    return { credencial, nomeSessao: row.nomeExibicao };
  };
}

export default AuthRepository;