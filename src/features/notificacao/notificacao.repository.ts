import { Prisma, PrismaClient } from "@prisma/client";
import { TipoEvento, TipoNotificacao } from "./notificacao.dto";
import Notificacao from "./notificacao.entity";
import Evento from "../../shared/domain/evento/evento.entity";

// Exported so the cron service can type-check the determinador function
export const eventoCronSelect = {
  idEvento_PK: true,
  dataInicio: true,
  safras: {
    select: {
      idPropriedade_FK: true,
      propriedades: { select: { idProprietario_FK: true } }
    }
  },
  eventosagricolas: {
    select: {
      armazenagens: { select: { idEventoAgricola_PFK: true } },
      tratosculturais: { select: { idEventoAgricola_PFK: true } },
      colheitas: { select: { idEventoAgricola_PFK: true } },
      fermentacoes: { select: { idEventoAgricola_PFK: true } },
      presecagens: { select: { idEventoAgricola_PFK: true } },
      secagens: { select: { idEventoAgricola_PFK: true } },
      pilagens: { select: { idEventoAgricola_PFK: true } }
    }
  },
  vendas: { select: { idEvento_PFK: true } }
} satisfies Prisma.eventosSelect;

export type EventoCronPayload = Prisma.eventosGetPayload<{ select: typeof eventoCronSelect }>;

type NotificacaoPayload = Prisma.notificacoesGetPayload<{}>;

class NotificacaoRepository {
  constructor(private readonly prisma: PrismaClient) { }

  public async criar(dto: Notificacao, tx: Prisma.TransactionClient): Promise<Notificacao> {
    const notificacao = await tx.notificacoes.create({
      data: {
        idProprietario_FK: dto.idProprietario,
        idPropriedade_FK: dto.idPropriedade,
        idEvento_FK: dto.idEvento,
        tipoEvento: dto.tipoEvento,
        tipoNotificacao: dto.tipoNotificacao
      }
    });
    return this.mapToEntity(notificacao);
  }

  public async listarTodas(idUsuario: number): Promise<Notificacao[]> {
    const notificacoes = await this.prisma.notificacoes.findMany({
      where: { idProprietario_FK: idUsuario },
      orderBy: {
        dataCriacao: 'desc'
      }
    });
    return await Promise.all(notificacoes.map((n) => this.mapToEntity(n)));
  }

  public async listarTodasPropriedade(idUsuario: number, idPropriedade: number): Promise<Notificacao[]> {
    const notificacoes = await this.prisma.notificacoes.findMany({
      where: {
        idProprietario_FK: idUsuario,
        idPropriedade_FK: idPropriedade
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    });
    return await Promise.all(notificacoes.map((n) => this.mapToEntity(n)));
  }

  public async listarNaoLidas(idUsuario: number): Promise<Notificacao[]> {
    const notificacoes = await this.prisma.notificacoes.findMany({
      where: {
        idProprietario_FK: idUsuario,
        lida: 0
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    });
    return await Promise.all(notificacoes.map((n) => this.mapToEntity(n)));
  }

  public async listarNaoLidasPropriedade(idUsuario: number, idPropriedade: number): Promise<Notificacao[]> {
    const notificacoes = await this.prisma.notificacoes.findMany({
      where: {
        idProprietario_FK: idUsuario,
        idPropriedade_FK: idPropriedade,
        lida: 0
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    });
    return await Promise.all(notificacoes.map((n) => this.mapToEntity(n)));
  }

  public async marcarComoLida(idsNotificacoes: number[], idUsuario: number): Promise<void> {
    await this.prisma.notificacoes.updateMany({
      where: {
        idNotificacao_PK: { in: idsNotificacoes },
        idProprietario_FK: idUsuario
      },
      data: {
        lida: 1
      }
    });
  }

  public async excluir(idsNotificacoes: number[], tx: Prisma.TransactionClient): Promise<void> {
    await tx.notificacoes.deleteMany({
      where: { idNotificacao_PK: { in: idsNotificacoes } }
    });
  }

  public async excluirPorEvento(evento: Evento, tx: Prisma.TransactionClient): Promise<void> {
    await tx.notificacoes.deleteMany({
      where: {
        idEvento_FK: evento.id,
      }
    });
  }

  public async limparNotificacoesAntigasDoEvento(idEvento: number, tx: Prisma.TransactionClient): Promise<void> {
    await tx.notificacoes.deleteMany({
      where: { idEvento_FK: idEvento }
    });
  }

  public async buscarEventosParaCron(limiteInferior: Date, limiteSuperior: Date): Promise<EventoCronPayload[]> {
    return await this.prisma.eventos.findMany({
      where: {
        dataFim: null,
        dataInicio: {
          gte: limiteInferior,
          lte: limiteSuperior
        }
      },
      select: eventoCronSelect
    });
  }

  public async limparNotificacoesAntigasLidas(limiteData: Date, tx: Prisma.TransactionClient): Promise<number> {
    const resultado = await tx.notificacoes.deleteMany({
      where: {
        lida: 1,
        dataCriacao: {
          lt: limiteData
        }
      }
    });
    return resultado.count;
  }

  private async mapToEntity(notificacaoDB: NotificacaoPayload): Promise<Notificacao> {
    return new Notificacao(
      notificacaoDB.idNotificacao_PK,
      notificacaoDB.idProprietario_FK,
      notificacaoDB.idPropriedade_FK,
      notificacaoDB.idEvento_FK,
      notificacaoDB.tipoEvento as TipoEvento,
      notificacaoDB.tipoNotificacao as TipoNotificacao,
      notificacaoDB.dataCriacao,
      notificacaoDB.lida === 1
    );
  }
}

export default NotificacaoRepository;