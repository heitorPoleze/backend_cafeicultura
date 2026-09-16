import { Prisma, PrismaClient } from "@prisma/client";
import Safra from "./safra.entity";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export class SafraRepository {
  constructor(private prisma: PrismaClient) { }

  public async contarSafrasAtivas(idPropriedade: number, tx: Prisma.TransactionClient = this.prisma): Promise<number> {
    return await tx.safras.count({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: null,
      },
    });
  };

  public async cadastrar(safra: Safra, tx: Prisma.TransactionClient = this.prisma): Promise<number> {
    const data = await tx.safras.create({
      data: {
        idPropriedade_FK: safra.idPropriedade,
        dataInicio: safra.dataInicio
      },
    });

    return data.idSafra_PK;
  };

  public async bucarAtivasPorPropriedade(idPropriedade: number, tx: Prisma.TransactionClient = this.prisma): Promise<Safra[]> {
    const data = await tx.safras.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: null,
      },
    });
    return data.map((safra) => new Safra(safra.idSafra_PK, safra.idPropriedade_FK, safra.dataInicio, safra.dataFim));
  }
  public async buscarSafrasPorPropriedade(idPropriedade: number, tx: Prisma.TransactionClient = this.prisma): Promise<Safra[]> {
    const data = await tx.safras.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
      },
    });
    return data.map((safra) => new Safra(safra.idSafra_PK, safra.idPropriedade_FK, safra.dataInicio, safra.dataFim));
  }

  public async buscarPorId(id: number, tx: Prisma.TransactionClient = this.prisma): Promise<Safra | null> {
    const data = await tx.safras.findUnique({
      where: {
        idSafra_PK: id,
      },
    });

    if (!data) return null;

    return new Safra(data.idSafra_PK, data.idPropriedade_FK, data.dataInicio, data.dataFim);
  }
  public async reativar(safra: Safra, tx: Prisma.TransactionClient = this.prisma): Promise<Safra> {
    if (!safra.id) throw new Error("ID_OBRIGATORIO");

    const data = await tx.safras.update({
      where: { idSafra_PK: safra.id },
      data: { dataFim: null },
    });

    return new Safra(data.idSafra_PK, data.idPropriedade_FK, data.dataInicio, data.dataFim);
  }
  
  public async finalizar(safra: Safra, tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    if (!safra.id) throw new Error("ID_OBRIGATORIO");

    await tx.safras.update({
      where: { idSafra_PK: safra.id },
      data: { dataFim: safra.dataFim },
    });
  }

  public async excluir(safra: Safra, tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    if (!safra.id) throw new Error("ID_OBRIGATORIO");

    try {
      await tx.safras.delete({
        where: { idSafra_PK: safra.id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("SAFRA_POSSUI_EVENTOS");
      }
      throw error;
    }
  }
}

export default SafraRepository;
