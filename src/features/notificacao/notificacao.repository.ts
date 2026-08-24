import { Prisma, PrismaClient } from "@prisma/client";
import { CriarNotificacaoDTO, TipoEvento, TipoNotificacao } from "./notificacao.dto";
import Notificacao from "./notificacao.entity";

type NotificacaoPayload = Prisma.notificacoesGetPayload<{}>;

class NotificacaoRepository {
  constructor(private readonly prisma: PrismaClient) { }

  public async criar(dto: CriarNotificacaoDTO): Promise<Notificacao> {
    const notificacao = await this.prisma.notificacoes.create({
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

  public async marcarComoLida(idNotificacao: number, idUsuario: number): Promise<void> {
    await this.prisma.notificacoes.updateMany({
      where: {
        idNotificacao_PK: idNotificacao,
        idProprietario_FK: idUsuario
      },
      data: {
        lida: 1
      }
    });
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