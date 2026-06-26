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

  
  //revisar
  public async updateEmail(email:string, id:number){
    await this.prisma.usuarios.update({
      where: { idUsuario_PFK: id },
      data: { email: email }
    });
  }
  public async updateTelefone(telefone:string, id:number){
    await this.prisma.usuarios.update({
      where: { idUsuario_PFK: id },
      data: { telefone: telefone }
    });
  }

  public async updateSenhaUser(novaSenha: string, id: number){
    await this.prisma.usuarios.update({
      where: { idUsuario_PFK: id },
      data: { senha: novaSenha }
    });
  }
  public async updateNomeUser(novoNome:string,id:number){
    await this.prisma.pessoasfisicas.update({
      where: {idPeFisica_PFK: id },
      data: {nome: novoNome}
    })
  }
  public async updateRazaoSocialUser(novaRazao:string,id:number){
    await this.prisma.pessoasjuridicas.update({
      where: {idPeJuridica_PFK: id},
      data: {razaoSocial: novaRazao}
    })
  }
}


export default UsuarioRepository;