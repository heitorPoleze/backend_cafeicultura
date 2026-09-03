import Usuario from "./usuario.entity";
import { Prisma, PrismaClient } from "@prisma/client";

class UsuarioRepository {
  constructor(private readonly prisma: PrismaClient) { }

  public async salvar(u: Usuario, pessoaId: number, tx: Prisma.TransactionClient): Promise<void> {
    await tx.usuarios.create({
      data: {
        idUsuario_PFK: pessoaId,
        email: u.email,
        telefone: u.telefone,
        senha: u.senha
      }
    });
  }

  public async verificarEmailExistente(email: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const db = tx ?? this.prisma;
    const existe = await db.usuarios.findUnique({
      where: { email }
    });
    return !!existe;
  }

  public async verificarTelefoneExistente(telefone: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const db = tx ?? this.prisma;
    const existe = await db.usuarios.findFirst({
      where: {
        telefone: telefone,
        pessoas: {
          idAdministrador_FK: null
        }
      }
    });
    return !!existe;
  }

  public async verificarInscricaoEstadualExistente(inscricaoEstadual: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const db = tx ?? this.prisma;
    const existe = await db.pessoasjuridicas.findFirst({
      where: {
        inscEstadual: inscricaoEstadual,
        pessoas: {
          idAdministrador_FK: null
        }
      }
    });
    return !!existe;
  }

  public async updateEmail(email: string, id: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    await db.usuarios.update({
      where: { idUsuario_PFK: id },
      data: { email: email }
    });
  }

  public async updateTelefone(telefone: string, id: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    await db.usuarios.update({
      where: { idUsuario_PFK: id },
      data: { telefone: telefone }
    });
  }

  public async updateSenhaUser(novaSenha: string, id: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    await db.usuarios.update({
      where: { idUsuario_PFK: id },
      data: { senha: novaSenha }
    });
  }

  public async updateNomeUser(novoNome: string, id: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    await db.pessoasfisicas.update({
      where: { idPeFisica_PFK: id },
      data: { nome: novoNome }
    });
  }

  public async updateRazaoSocialUser(novaRazao: string, id: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    await db.pessoasjuridicas.update({
      where: { idPeJuridica_PFK: id },
      data: { razaoSocial: novaRazao }
    });
  }

  public async updateInscricaoEstadualUser(novaInscricao: string, id: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    await db.pessoasjuridicas.update({
      where: { idPeJuridica_PFK: id },
      data: { inscEstadual: novaInscricao }
    });
  }
}

export default UsuarioRepository;