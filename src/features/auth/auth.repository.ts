import { PrismaClient } from "@prisma/client";
import Credencial from "./auth.entity";

class AuthRepository {
  constructor(private db: PrismaClient) {}

  /**
   * Salva uma nova credencial. 
   * Aceita um cliente Prisma opcional (para uso em transações).
   */
  public async salvarCredencial(
    credencial: Credencial, 
    idUsuarioRef: number, 
  ): Promise<void> {
  const client = this.db;
    await client.usuarios.create({
      data: {
        idUsuario_PFK: idUsuarioRef,
        email: credencial.email,
        telefone: credencial.telefone,
        senha: credencial.senha,
      },
    });
  };

  // Busca Inteligente para Login: Traz a credencial e o Nome para a Sessão
  public async buscarParaLogin(
    entrada: string, 
    tipo: "email" | "cpf" | "cnpj"
  ): Promise<{ credencial: Credencial, nomeSessao: string } | null> {
    let usuario = null;

    if (tipo === "email") {
      usuario = await this.db.usuarios.findFirst({
        where: { email: entrada },
      });
    } else if (tipo === "cpf") {
      // Para CPF, busca na tabela pessoasfisicas primeiro
      const pf = await this.db.pessoasfisicas.findFirst({
        where: { cpf: entrada },
      });
      if (pf) {
        usuario = await this.db.usuarios.findFirst({
          where: { idUsuario_PFK: pf.idPeFisica_PFK },
        });
      }
    } else if (tipo === "cnpj") {
      // Para CNPJ, busca na tabela pessoasjuridicas primeiro
      const pj = await this.db.pessoasjuridicas.findFirst({
        where: { cnpj: entrada },
      });
      if (pj) {
        usuario = await this.db.usuarios.findFirst({
          where: { idUsuario_PFK: pj.idPeJuridica_PFK },
        });
      }
    }

    if (!usuario) return null;

    // Busca o nome na tabela de pessoas
    const pessoa = await this.db.pessoas.findUnique({
      where: { idPessoa_PK: usuario.idUsuario_PFK },
      include: {
        pessoasfisicas: true,
        pessoasjuridicas: true,
      },
    });
    
    const nomeSessao =
      pessoa?.pessoasfisicas?.nome ||
      (pessoa?.pessoasjuridicas as unknown as { razaoSocial: string })?.razaoSocial ||
      usuario.email ||
      "Usuário";

    const credencial = new Credencial(
      usuario.email, 
      usuario.telefone, 
      usuario.senha, 
      usuario.idUsuario_PFK
    );

    return { credencial, nomeSessao };
  }
}

export default AuthRepository;