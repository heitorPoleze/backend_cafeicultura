import Usuario from "./usuario.entity";
import { Prisma, PrismaClient } from "@prisma/client";

class UsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async salvar(u: Usuario, pessoaId: number, tx: Prisma.TransactionClient): Promise<void> {
    await tx.usuarios.create({
      data: {
        idUsuario_PFK: pessoaId,
        email: u.email,
        telefone: u.telefone,
        senha: u.senha
      }
    });
  };
  
  public async verificarEmailExistente(email: string): Promise<boolean> {
    const existe = await this.prisma.usuarios.findUnique({
      where: { email }
    });
    return !!existe;
  };

  public async verificarTelefoneExistente(telefone: string): Promise<boolean> {
    const existe = await this.prisma.usuarios.findUnique({
      where: { telefone }
    });
    return !!existe;
  };
}

export default UsuarioRepository;