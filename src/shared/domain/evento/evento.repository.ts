import { Prisma, PrismaClient } from "@prisma/client";
import Evento from "./evento.entity";
import DespesaRepository from "../../../features/despesa/despesa.repository";

class EventoRepository {
  constructor(
    private prisma: PrismaClient,
    private despesaRepo: DespesaRepository
  ) {};

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

  public async atualizarDescricao(
    evento: Evento,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this.prisma;

    await client.eventos.update({
      where: { idEvento_PK: evento.id },
      data: { descricao: evento.descricao },
    });   
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

  public async excluirTransacoes(evento: Evento): Promise<void> {
    evento.transacoesFinanceiras!.forEach(async (transacao) => {
      await this.despesaRepo.excluir(transacao.id as number, this.prisma);
    });
  };

  public async inserirResponsaveis(evento: Evento): Promise<void> {
    if (!evento.responsaveis || evento.responsaveis.length === 0) {
      return;
    };

    await this.prisma.pessoaseventos.createMany({
      data: evento.responsaveis.map((resp) => ({
        idPessoa_PFK: resp.id as number,
        idEvento_PFK: evento.id as number,
      })),
    });
  };

  public async excluirResponsaveis(evento: Evento, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || this.prisma;

    await client.pessoaseventos.deleteMany({
      where: { 
        idEvento_PFK: evento.id,
        idPessoa_PFK: { notIn: evento.responsaveis!.map((resp) => resp.id as number) }
      },
    });
  };
};

export default EventoRepository;