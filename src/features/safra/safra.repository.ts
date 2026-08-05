import { PrismaClient } from "@prisma/client";
import Safra from "./safra.entity";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export class SafraRepository {
  constructor(private prisma: PrismaClient) {}

  public async contarSafrasAtivas(idPropriedade: number): Promise<number> {
    return await this.prisma.safras.count({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: null,
      },
    });
  };

  public async cadastrar(safra: Safra): Promise<number> {
    const data = await this.prisma.safras.create({
      data: {
        idPropriedade_FK: safra.idPropriedade,
        dataInicio: safra.dataInicio,
      },
    });

    return data.idSafra_PK;
  };
  
  public async bucarAtivasPorPropriedade(idPropriedade: number): Promise<Safra[]> {
    const data = await this.prisma.safras.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: null,
      },
    });
    return data.map((safra) => new Safra({
      id: safra.idSafra_PK,
      idPropriedade: safra.idPropriedade_FK,
      dataInicio: safra.dataInicio,
      dataFim: safra.dataFim,
    }));
  }
  public async buscarSafrasPorPropriedade(idPropriedade: number): Promise<Safra[]> {
    const data = await this.prisma.safras.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
      },
    });
    return data.map((safra) => new Safra({
      id: safra.idSafra_PK,
      idPropriedade: safra.idPropriedade_FK,
      dataInicio: safra.dataInicio,
      dataFim: safra.dataFim,
    }));
  }

  public async buscarPorId(id: number): Promise<Safra | null> {
    const data = await this.prisma.safras.findUnique({
      where: { 
        idSafra_PK: id,
      },
    });

    if (!data) return null;

    return new Safra({
      id: data.idSafra_PK,
      idPropriedade: data.idPropriedade_FK,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
    });
  }
public async reativar(safra: Safra): Promise<Safra | null> {
  if (!safra.id) throw new Error("ID_OBRIGATORIO");

  const data = await this.prisma.safras.update({
    where: { idSafra_PK: safra.id },
    data: { dataFim: null },
  });

  return new Safra({
    id: data.idSafra_PK,
    idPropriedade: data.idPropriedade_FK,
    dataInicio: data.dataInicio,
    dataFim: data.dataFim,
  });
}
  public async finalizar(safra: Safra): Promise<void> {
    if (!safra.id) throw new Error("ID_OBRIGATORIO");

    await this.prisma.safras.update({
      where: { idSafra_PK: safra.id },
      data: { dataFim: safra.dataFim },
    });
  }

  public async excluir(safra: Safra): Promise<void> {
    if (!safra.id) throw new Error("ID_OBRIGATORIO");

    try {
      await this.prisma.safras.delete({
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
