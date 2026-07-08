import { PrismaClient } from "@prisma/client";
import Safra from "./safra.entity";

export class SafraRepository {
  constructor(private prisma: PrismaClient) {}

  public async contarSafrasAtivas(idPropriedade: number): Promise<number> {
    return await this.prisma.safras.count({
      where: {
        idPropriedade_FK: idPropriedade,
        dataFim: null,
        arquivada: false,
      },
    });
  };

  public async cadastrar(safra: Safra): Promise<number> {
    const data = await this.prisma.safras.create({
      data: {
        idPropriedade_FK: safra.idPropriedade,
        dataInicio: safra.dataInicio,
        arquivada: safra.arquivada,
      },
    });

    return data.idSafra_PK;
  };

  public async buscarPorId(id: number): Promise<Safra | null> {
    const data = await this.prisma.safras.findUnique({
      where: { 
        idSafra_PK: id,
        arquivada: false
      },
    });

    if (!data) return null;

    return new Safra({
      id: data.idSafra_PK,
      idPropriedade: data.idPropriedade_FK,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      arquivada: data.arquivada,
    });
  }

  public async finalizar(safra: Safra): Promise<void> {
    if (!safra.id) throw new Error("ID_OBRIGATORIO");

    await this.prisma.safras.update({
      where: { idSafra_PK: safra.id },
      data: { dataFim: safra.dataFim },
    });
  }

  public async arquivar(safra: Safra): Promise<void> {
    if (!safra.id) throw new Error("ID_OBRIGATORIO");

    await this.prisma.safras.update({
      where: { idSafra_PK: safra.id },
      data: { arquivada: safra.arquivada },
    });
  }
}

export default SafraRepository;
