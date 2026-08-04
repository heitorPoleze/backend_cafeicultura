import Propriedade from "./propriedade.entity";
import { Prisma, PrismaClient } from "@prisma/client";
import Tamanho from "../../shared/domain/tamanho/tamanho.entity";
import Endereco from "../../shared/domain/endereco/endereco.vo";
class PropriedadeRepository {
  constructor(private db: PrismaClient) {}

  public async salvar(prop: Propriedade, tx: Prisma.TransactionClient): Promise<number> {
    const novaPropriedade = await tx.propriedades.create({
      data: {
        nome: prop.nome,
        proprietarios: {
          connect: {
            idProprietario_PFK: prop.idProprietario,
          },
        },
        tamanhos: {
          create: {
            valor: prop.tamanho.valor,
            medida: prop.tamanho.medida,
          },
        },
        enderecos: {
          create: {
            logradouro: prop.endereco.logradouro,
            bairro: prop.endereco.bairro,
            cidade: prop.endereco.cidade,
            uf: prop.endereco.uf,
            pais: prop.endereco.pais,
            cep: prop.endereco.cep,
          },
        },
      },
    });

    return novaPropriedade.idPropriedade_PK;
  };

  public async buscarPorId(idPropriedade: number): Promise<Propriedade | null> {
    const prop = await this.db.propriedades.findUnique({
      where: { 
        idPropriedade_PK: idPropriedade 
      },
      include: {
        tamanhos: true,
        enderecos: true,
      },
    });

    if (!prop) return null;
    
    const tamanhoEntidade = new Tamanho(Number(prop.tamanhos.valor), prop.tamanhos.medida as "hectare" | "m2", prop.tamanhos.idTamanho_PK);
    const enderecoEntidade = new Endereco(
      prop.enderecos.cidade, prop.enderecos.bairro, prop.enderecos.cep, 
      prop.enderecos.uf, prop.enderecos.pais, prop.enderecos.logradouro, 
      prop.enderecos.idEndereco_PK
    );
    
    return new Propriedade(prop.nome, prop.idProprietario_FK, tamanhoEntidade, enderecoEntidade, prop.idPropriedade_PK);
  };

  public async atualizarNome(idPropriedade: number, novoNome: string): Promise<void> {
    await this.db.propriedades.update({
      where: { idPropriedade_PK: idPropriedade },
      data: { nome: novoNome }
    });
  };

  public async atualizarTamanho(idTamanho: number, tamanho: Tamanho): Promise<void> {
    await this.db.tamanhos.update({
      where: { idTamanho_PK: idTamanho },
      data: { valor: tamanho.valor, medida: tamanho.medida }
    });
  };

  public async atualizarEndereco(idEndereco: number, endereco: Endereco): Promise<void> {
    await this.db.enderecos.update({
      where: { idEndereco_PK: idEndereco },
      data: {
        logradouro: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        pais: endereco.pais,
        cep: endereco.cep
      }
    });
  };

  public async listarPorProprietario(idProprietario: number): Promise<Propriedade[] | null> {
    const propriedades = await this.db.propriedades.findMany({
      where: { idProprietario_FK: idProprietario },
      include: {
        tamanhos: true,
        enderecos: true
      }
    });

    return propriedades.map(p => {
      const tamanho = new Tamanho(Number(p.tamanhos.valor), p.tamanhos.medida as "hectare" | "m2", p.tamanhos.idTamanho_PK);
      const endereco = new Endereco(
        p.enderecos.cidade, p.enderecos.bairro, p.enderecos.cep, 
        p.enderecos.uf, p.enderecos.pais, p.enderecos.logradouro, 
        p.enderecos.idEndereco_PK
      );
      return new Propriedade(p.nome, p.idProprietario_FK, tamanho, endereco, p.idPropriedade_PK);
    });
  };

  public async excluir(idPropriedade: number): Promise<void> {
    try {
       await this.db.$transaction(async (tx) => {
        const p = await tx.propriedades.findUnique({
          where: { idPropriedade_PK: idPropriedade },
          include: {
            tamanhos: true,
            enderecos: true
          }
        });
        await tx.propriedades.delete({
          where: { idPropriedade_PK: p?.idPropriedade_PK }
        });
        await tx.tamanhos.delete({
          where: { idTamanho_PK: p?.idTamanho_FK }
        });
        await tx.enderecos.delete({
          where: { idEndereco_PK: p?.idEndereco_FK }
        });
       });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("PROPRIEDADE_POSSUI_ASSOCIACOES");
      };
      throw error;
    };
  };

  public async verificarNome(p: Propriedade, tx: Prisma.TransactionClient): Promise<boolean> {
    const propriedade = await tx.propriedades.findFirst({
      where: {
        nome: p.nome,
        idProprietario_FK: p.idProprietario
      }
    });
    return !!propriedade;
  }
};

export default PropriedadeRepository;