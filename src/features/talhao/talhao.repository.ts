import { PrismaClient, Prisma } from "@prisma/client";
import Talhao, { Especie } from "./talhao.entity";
import Tamanho from "../../shared/domain/tamanho/tamanho.entity";
import Variedade from "../../shared/domain/variedade/variedade.entity";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

type TalhaoCompleto = Prisma.talhoesGetPayload<{
  include: {
    tamanhos: true;
    variedadestalhoes: {
      include: { variedades: true };
    };
  };
}>;

class TalhaoRepository {
  constructor(private prisma: PrismaClient) { };

  async cadastrar(talhao: Talhao, variedadesIds: number[]): Promise<number> {
    const talhaoDb = await this.prisma.talhoes.create({
      data: {
        nome: talhao.nome,
        qtdPeCafe: talhao.qtdPeCafe,
        especie: talhao.especie,
        dataInicio: talhao.dataInicio,
        propriedades: {
          connect: {
            idPropriedade_PK: talhao.idPropriedade,
          },
        },
        tamanhos: {
          create: {
            valor: talhao.tamanho.valor,
            medida: talhao.tamanho.medida,
          },
        },
        variedadestalhoes: {
          create: variedadesIds.map((id) => ({
            idVariedade_PFK: id,
          })),
        },
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
    });

    return talhaoDb.idTalhao_PK;
  }

  public async buscarAbertosPorPropriedade(
    idPropriedade: number,
  ): Promise<Talhao[]> {
    const talhoesDb = await this.prisma.talhoes.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: null,
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
    });

    return talhoesDb.map((db) => this.mapToDomain(db));
  }

  public async buscarFinalizadosPorPropriedade(
    idPropriedade: number, pagina: number, limite: number
  ): Promise<{ pagina: number; limite: number; dados: Talhao[] }> {
    const talhoesDb = await this.prisma.talhoes.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: { not: null },
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });

    return {
      pagina,
      limite,
      dados: talhoesDb.map((db) => this.mapToDomain(db))
    };
  }

  public async buscarTodosPorPropriedade(
    idPropriedade: number, pagina: number, limite: number
  ): Promise<{ pagina: number; limite: number; dados: Talhao[] }> {
    const talhoesDb = await this.prisma.talhoes.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });

    return {
      pagina,
      limite,
      dados: talhoesDb.map((db) => this.mapToDomain(db))
    };
  }
  async buscarPorId(id: number): Promise<Talhao | null> {
    const talhaoDb = await this.prisma.talhoes.findFirst({
      where: {
        idTalhao_PK: id,
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
    });

    if (!talhaoDb) return null;
    return this.mapToDomain(talhaoDb);
  }

  async encerrar(talhao: Talhao): Promise<void> {
    if (!talhao.id) throw new Error("ID do talhão é obrigatório.");

    await this.prisma.talhoes.update({
      where: { idTalhao_PK: talhao.id },
      data: {
        dataFim: talhao.dataFim,
      },
    });
  }

  public async excluir(talhao: Talhao): Promise<void> {
    if (!talhao.id) throw new Error("ID do talhão é obrigatório.");

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.variedadestalhoes.deleteMany({
          where: { idTalhao_PFK: talhao.id }
        });
        await tx.talhoes.delete({
          where: { idTalhao_PK: talhao.id }
        });
        await tx.tamanhos.delete({
          where: { idTamanho_PK: talhao.tamanho.id },
        });
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("TALHAO_POSSUI_EVENTOS");
      }
      throw error;
    }
  } 
  
  public async buscarVariedades(): Promise<
    { id: number; descricao: string; especie: Especie }[]
  > {
    const variedades = await this.prisma.variedades.findMany();

    return variedades.map((variedade) => ({
      id: variedade.idVariedade_PK,
      descricao: variedade.descricao,
      especie: variedade.especie === 0 ? Especie.Arabica : variedade.especie === 1 ? Especie.Conilon : Especie.Mista
    }));
  }

  private mapToDomain(db: TalhaoCompleto): Talhao {
    const tamanhoDomain = new Tamanho(
      Number(db.tamanhos.valor),
      db.tamanhos.medida as "m2" | "hectare",
      db.tamanhos.idTamanho_PK,
    );

    const descricoesVariedades = db.variedadestalhoes.map(
      (vt) => new Variedade(vt.variedades.idVariedade_PK, vt.variedades.descricao, vt.variedades.especie === 0 ? Especie.Arabica : vt.variedades.especie === 1 ? Especie.Conilon : Especie.Mista)
    );

    return new Talhao(
      db.idTalhao_PK,
      db.nome,
      tamanhoDomain,
      db.idPropriedade_FK,
      db.qtdPeCafe,
      db.especie as Especie,
      descricoesVariedades,
      null,
      db.dataInicio,
      db.dataFim,
    );
  }
}

export default TalhaoRepository;
