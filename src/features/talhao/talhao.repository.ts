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

const mapaEspecies: Record<string, Especie> = {
  "Arábica": Especie.ARABICA,
  "Conilon": Especie.CONILON,
  "Mista": Especie.MISTA
};

const mapaEspeciesPorId: Record<number, Especie> = {
  0: Especie.ARABICA,
  1: Especie.CONILON,
  2: Especie.MISTA
};

class TalhaoRepository {
  constructor(private prisma: PrismaClient) { };

  async cadastrar(talhao: Talhao, variedadesIds: number[] | null, tx: Prisma.TransactionClient = this.prisma): Promise<number> {
    const talhaoDb = await tx.talhoes.create({
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
        ...(variedadesIds ? {
          variedadestalhoes: {
            create: variedadesIds.map((id) => ({
              idVariedade_PFK: id,
            })),
          },
        } : {}),
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
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<Talhao[]> {
    const talhoesDb = await tx.talhoes.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: null,
      },
      orderBy: {
        idTalhao_PK: 'desc',
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
    });

    return talhoesDb.map((db) => this.mapToEntity(db));
  }
  public async buscarEventosPosterioresEncerramento(
    talhaoId: number,
    dataFechamento: Date,
  ) {
    const eventosPosteriores = await this.prisma.eventosagricolas.findMany({
      where: {
        idTalhao_FK: talhaoId,
        eventos: {
          dataInicio: { gt: dataFechamento },
        },
      },
      include: {
        eventos: true,
      },
    });

    return eventosPosteriores;
  }

  public async buscarFinalizadosPorPropriedade(
    idPropriedade: number, pagina: number, limite: number
  ): Promise<{ pagina: number; limite: number; dados: Talhao[] }> {
    const talhoesDb = await this.prisma.talhoes.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: { not: null },
      },
      orderBy: {
        idTalhao_PK: 'desc',
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
      dados: talhoesDb.map((db) => this.mapToEntity(db))
    };
  }

  public async buscarTodosPorPropriedade(
    idPropriedade: number, pagina: number, limite: number
  ): Promise<{ pagina: number; limite: number; dados: Talhao[] }> {
    const talhoesDb = await this.prisma.talhoes.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
      },
      orderBy: {
        idTalhao_PK: 'desc',
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
      dados: talhoesDb.map((db) => this.mapToEntity(db))
    };
  }
  async buscarPorId(id: number, tx: Prisma.TransactionClient = this.prisma): Promise<Talhao | null> {
    const talhaoDb = await tx.talhoes.findFirst({
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
    return this.mapToEntity(talhaoDb);
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

  public async buscarVariedades(): Promise<{ id: number; descricao: string; especie: Especie }[]> {
    const variedades = await this.prisma.variedades.findMany();

    return variedades.map((variedade) => ({
      id: variedade.idVariedade_PK,
      descricao: variedade.descricao,
      especie: mapaEspeciesPorId[variedade.especie],
    }));
  }

  private mapToEntity(db: TalhaoCompleto): Talhao {
    const tamanhoDomain = new Tamanho(
      Number(db.tamanhos.valor),
      db.tamanhos.medida as "m2" | "hectare",
      db.tamanhos.idTamanho_PK,
    );

    const descricoesVariedades = db.variedadestalhoes ?
      db.variedadestalhoes.map((vt) => new Variedade(
        vt.variedades.idVariedade_PK,
        vt.variedades.descricao,
        mapaEspeciesPorId[vt.variedades.especie],
      )) : null;

    return new Talhao(
      db.idTalhao_PK,
      db.nome,
      tamanhoDomain,
      db.idPropriedade_FK,
      db.qtdPeCafe,
      mapaEspecies[db.especie],
      db.dataInicio,
      descricoesVariedades,
      null,
      db.dataFim
    );
  }
}

export default TalhaoRepository;
