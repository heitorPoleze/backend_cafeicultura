import Usuario from "./usuario.entity";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import { PrismaClient } from "@prisma/client";

/**
 * Repositório para a entidade Usuario.
 * Centraliza o acesso ao banco de dados para operações de leitura e persistência de usuários.
 */
export default class UsuarioRepository {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Busca um usuário completo pelo seu ID.
   * Realiza JOIN com as tabelas de pessoas, endereços e documentos.
   */
  public async buscarPorId(id: number): Promise<Usuario | null> {
    /*const sql = `
      SELECT 
        u.idUsuario_PFK, u.email, u.telefone, u.senha, u.dataCadastro,
        COALESCE(pf.nome, pj.razaoSocial) AS nomeExibicao,
        e.idEndereco, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep,
        (
          SELECT GROUP_CONCAT(doc.numero) 
          FROM documentos doc 
          WHERE doc.idPessoa_FK = u.idUsuario_PFK
        ) AS documentos
      FROM usuarios u
      INNER JOIN pessoas p ON u.idUsuario_PFK = p.idPessoa_PK
      LEFT JOIN pessoasfisicas pf ON p.idPessoa_PK = pf.idPeFisica_PFK
      LEFT JOIN pessoasjuridicas pj ON p.idPessoa_PK = pj.idPeJuridica_PFK
      LEFT JOIN enderecos e ON p.idPessoa_PK = e.idPessoa_FK
      WHERE u.idUsuario_PFK = ?;
    `;*/

    const usuario = await this.db.usuarios.findUnique({
      where: { idUsuario_PFK: id },
    });

    if (!usuario) return null;

    const p = await this.db.pessoas.findUnique({
      where: { idPessoa_PK: usuario.idUsuario_PFK },
      include: {
        pessoasfisicas: true,
        pessoasjuridicas: true,
        enderecos: true
      }
    });

    if (!p) return null;
    if (!usuario) return null;

    const pf = p.pessoasfisicas;
    const pj = p.pessoasjuridicas;
    const e = p.enderecos;

    const endereco = e 
      ? new Endereco(e.logradouro, e.bairro, e.cidade, e.uf, e.pais, e.cep, e.idEndereco_PK)
      : undefined;

    const nomeExibicao = pf?.nome || pj?.razaoSocial || "Usuário";
    const documentos: string[] = [];
    if (pf) documentos.push(pf.cpf);
    if (pj) documentos.push(pj.cnpj);

    return new Usuario(
      usuario.email,
      usuario.telefone,
      usuario.senha,
      documentos,
      nomeExibicao,
      usuario.idUsuario_PFK,
      p.dataCadastro,
      endereco
    );
  }

}
