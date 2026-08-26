import { Prisma, PrismaClient } from "@prisma/client";
import Evento from "./evento.entity";
import DespesaRepository from "../../../features/despesa/despesa.repository";

class EventoRepository {
  constructor(
    private prisma: PrismaClient,
    private despesaRepo: DespesaRepository
  ) { };

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
      },
    });
    return eventoDB.idEvento_PK;
  };

  public async atualizarDescricao(
    evento: Evento,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    await tx.eventos.update({
      where: { idEvento_PK: evento.id },
      data: { descricao: evento.descricao },
    });
  };
  
  public async editarInicio(
    evento: Evento,
    tx: Prisma.TransactionClient = this.prisma, 
  ): Promise<void> {

    await tx.eventos.update({
      where: { idEvento_PK: evento.id },
      data: { dataInicio: evento.dataInicio },
    });
  };

  public async finalizar(
    evento: Evento,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {

    await tx.eventos.update({
      where: { idEvento_PK: evento.id },
      data: { 
        dataInicio: evento.dataInicio,
        dataFim: evento.dataFim 
      },
    });
  };

  public async excluirTransacoes(evento: Evento, tx: Prisma.TransactionClient): Promise<void> {
    evento.transacoesFinanceiras!.forEach(async (transacao) => {
      await this.despesaRepo.excluir(transacao.id as number, tx);
    });
  };

  public async editarResponsaveis(evento: Evento, tx: Prisma.TransactionClient): Promise<void> {
    if (!evento.id) throw new Error("ID_OBRIGATORIO");

    const responsaveisIncomingIds = evento.responsaveis 
      ? evento.responsaveis.map((resp) => resp.id as number) 
      : [];

    await tx.pessoaseventos.deleteMany({
      where: {
        idEvento_PFK: evento.id,
        ...(responsaveisIncomingIds.length > 0 && {
          idPessoa_PFK: { notIn: responsaveisIncomingIds }
        })
      },
    });

    if (responsaveisIncomingIds.length === 0) {
      return;
    }

    const registrosExistentes = await tx.pessoaseventos.findMany({
      where: { idEvento_PFK: evento.id },
      select: { idPessoa_PFK: true }
    });
    
    const idsNoBanco = registrosExistentes.map(reg => reg.idPessoa_PFK);

    const idsParaCriar = responsaveisIncomingIds.filter(id => !idsNoBanco.includes(id));

    if (idsParaCriar.length > 0) {
      await tx.pessoaseventos.createMany({
        data: idsParaCriar.map(idPessoa => ({
          idEvento_PFK: evento.id!,
          idPessoa_PFK: idPessoa,
        })),
      });
    }
  }

  public async excluir(evento: Evento, tx: Prisma.TransactionClient): Promise<void> {
    if (!evento.id) throw new Error("ID_OBRIGATORIO");
    await this.despesaRepo.excluirPorEvento(evento.id, tx);
    await tx.pessoaseventos.deleteMany({ where: { idEvento_PFK: evento.id } });
    await tx.eventos.delete({ where: { idEvento_PK: evento.id } });
  }
};

export default EventoRepository;