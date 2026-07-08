import { Prisma, PrismaClient } from "@prisma/client";
import Evento from "./evento.entity";

class EventoRepository {
  constructor(private prisma: PrismaClient) {};

  public async cadastrar(
    evento: Evento,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx || this.prisma;

    const eventoDB = await client.eventos.create({
      data: {
        dataInicio: evento.dataInicio,
        dataFim: evento.dataFim,
        descricao: evento.descricao,
        dataCadastro: evento.dataCadastro,
        idSafra_FK: evento.safra.id!,
        pessoaseventos:
          evento.responsaveis && evento.responsaveis.length > 0
            ? {
                createMany: {
                  data: evento.responsaveis
                    .filter((resp) => resp.id !== undefined)
                    .map((resp) => ({
                      idPessoa_PFK: resp.id as number,
                    })),
                },
              }
            : undefined,
        confirmado: evento.confirmado ? 1 : 0,
      },
    });
    return eventoDB.idEvento_PK;
  };

  public async finalizar(
    evento: Evento,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this.prisma;

    await client.eventos.update({
      where: { idEvento_PK: evento.id },
      data: { dataFim: evento.dataFim },
    });
  };

  public async confirmar(
    evento: Evento,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this.prisma;

    await client.eventos.update({
      where: { idEvento_PK: evento.id },
      data: { confirmado: evento.confirmado ? 1 : 0 },
    });
  };
};

export default EventoRepository;