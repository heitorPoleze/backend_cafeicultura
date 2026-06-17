import { PrismaClient } from "@prisma/client";
import Credencial from "./auth.entity";

class AuthRepository {
  constructor(private db: PrismaClient) {}

  public async autenticar(
    entrada: string, 
    tipo: "email" | "cpf" | "cnpj"
  ): Promise<{ credencial: Credencial, nomeSessao: string } | null> {
    let usuario = null;
    let nomeSessao = "Usuário";

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

    if (pessoa) {
      if (pessoa.pessoasfisicas) {
        nomeSessao = pessoa.pessoasfisicas.nome;
      } else if (pessoa.pessoasjuridicas) {
        nomeSessao = pessoa.pessoasjuridicas.razaoSocial;
      }
    };
    
    const credencial = new Credencial(
      tipo,
      entrada, 
      usuario.senha, 
      usuario.idUsuario_PFK
    );

    return { credencial, nomeSessao };
  }
}

export default AuthRepository;