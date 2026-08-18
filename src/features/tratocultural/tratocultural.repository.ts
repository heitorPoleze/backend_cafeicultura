import { Prisma, PrismaClient } from "@prisma/client";
import TratoCultural, { TipoTrato } from "./tratocultural.entity";
import EventoAgricolaRepository from "../../shared/domain/evento/eventoagricola/eventoagricola.repository";
import EventoRepository from "../../shared/domain/evento/evento.repository";
import Safra from "../safra/safra.entity";
import Insumo, { MedidaInsumo } from "../../shared/domain/insumo/insumo.entity";
import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import PessoaBaseRepository from "../../shared/domain/pessoa/pessoa.repository";
import PessoaBase from "../../shared/domain/pessoa/pessoabase.entity";
import Despesa from "../despesa/despesa.entity";
import DespesaRepository from "../despesa/despesa.repository";
import { StatusTrato } from "./tratocultural.dto";

type TratoCulturalPayload = Prisma.tratosculturaisGetPayload<{
  include: {
    tipostratos: true;
    tratosinsumos: {
      include: {
        insumos: true;
      };
    };
    eventosagricolas: {
      include: {
        eventos: {
          include: {
            safras: true;
            pessoaseventos: {
              include: {
                pessoas: true;
              };
            };
            transacoesfinanceiras: {
              include: {
                formaspgto: true;
                despesas: true;
              };
            };
          };
        };
      };
    };
  };
}>;

type TratoInsumoPayload = Prisma.tratosinsumosGetPayload<{
  include: {
    insumos: true;
  };
}>;

class TratoCulturalRepository {
  constructor(
    private prisma: PrismaClient,
    private eventoRepo: EventoRepository,
    private eventoAgricolaRepo: EventoAgricolaRepository,
    private pessoaBaseRepo: PessoaBaseRepository,
    private despesaRepo: DespesaRepository
  ) { }

  public async cadastrar(
    trato: TratoCultural,
    idTipoTrato: number
  ): Promise<number> {
    return await this.prisma.$transaction(async (tx) => {
      const id = await this.eventoRepo.cadastrar(trato, tx);
      await this.eventoAgricolaRepo.cadastrar(trato, id, tx);
      await tx.tratosculturais.create({
        data: {
          idEventoAgricola_PFK: id,
          idTipoTrato_FK: idTipoTrato,
          tratosinsumos:
            trato.insumosUtilizados && trato.insumosUtilizados.length > 0
              ? {
                createMany: {
                  data: trato.insumosUtilizados.map((tratoInsumo) => ({
                    idInsumo_PFK: tratoInsumo.insumo.id!,
                    qtdUsada: tratoInsumo.qtdUsada,
                  })),
                },
              }
              : undefined,
        },
      });
      if (trato.transacoesFinanceiras && trato.transacoesFinanceiras.length > 0) {
        trato.transacoesFinanceiras.forEach(async (transacao) => {
          transacao.idEvento = id;
          await this.despesaRepo.cadastrar(transacao, tx);
        });
      };
      return id;
    });
  };

  public async buscarPorId(id: number): Promise<TratoCultural | null> {
    const tratoCulturalDB = await this.prisma.tratosculturais.findUnique({
      where: {
        idEventoAgricola_PFK: id,
      },
      include: {
        tipostratos: true,
        tratosinsumos: {
          include: {
            insumos: true,
          },
        },
        eventosagricolas: {
          include: {
            eventos: {
              include: {
                safras: true,
                pessoaseventos: {
                  include: {
                    pessoas: true,
                  },
                },
                transacoesfinanceiras: {
                  include: {
                    formaspgto: true,
                    despesas: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tratoCulturalDB) {
      return null;
    }

    return await this.mapToEntity(tratoCulturalDB);
  }

  public async listarTodosPropriedade(
    idPropriedade: number,
    pagina?: number,
    filtroInicio?: Date,
    filtroFim?: Date,
    status?: StatusTrato,
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<{ total: number; tratos: TratoCultural[] }> {

    const limite = 25;
    const skip = pagina ? (pagina - 1) * limite : undefined;
    const take = pagina ? limite : undefined;
    const eventosConditions: Prisma.eventosWhereInput[] = [];
    const dataAtual = new Date();

    if (status === 'agendados') {
      eventosConditions.push({
        dataInicio: { gt: dataAtual },
        dataFim: null
      });
    } else if (status === 'em_andamento') {
      eventosConditions.push({
        dataInicio: { lte: dataAtual },
        dataFim: null
      });
    } else if (status === 'finalizados') {
      eventosConditions.push({
        dataFim: { not: null }
      });
    } else if (status === 'todos') {
      eventosConditions.push({});
    }

    if (filtroInicio || filtroFim) {
      eventosConditions.push({
        dataInicio: {
          ...(filtroInicio && { gte: filtroInicio }),
          ...(filtroFim && { lte: filtroFim }),
        }
      });
    }

    const whereClause: Prisma.tratosculturaisWhereInput = {
      eventosagricolas: {
        talhoes: {
          idPropriedade_FK: idPropriedade,
        },
        eventos: eventosConditions.length > 0 ? { AND: eventosConditions } : undefined,
      },
    };

    const [total, tratosDb] = await Promise.all([
      tx.tratosculturais.count({ where: whereClause }),

      tx.tratosculturais.findMany({
        where: whereClause,
        orderBy: {
          eventosagricolas: {
            eventos: {
              dataInicio: 'desc',
            },
          },
        },
        skip,
        take,
        include: {
          tipostratos: true,
          tratosinsumos: { include: { insumos: true } },
          eventosagricolas: {
            include: {
              eventos: {
                include: {
                  safras: true,
                  pessoaseventos: { include: { pessoas: true } },
                  transacoesfinanceiras: {
                    include: { formaspgto: true, despesas: true }
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const tratosMapeados = await Promise.all(
      tratosDb.map((t) => this.mapToEntity(t, tx))
    );

    return { total, tratos: tratosMapeados };
  }

  public async listarTodosSafra(
    idSafra: number,
    idPropriedade: number,
    pagina?: number,
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<{ total: number; tratos: TratoCultural[] }> {

    const limite = 25;
    const skip = pagina ? (pagina - 1) * limite : undefined;
    const take = pagina ? limite : undefined;

    const whereClause: Prisma.tratosculturaisWhereInput = {
      eventosagricolas: {
        eventos: {
          safras: {
            idSafra_PK: idSafra,
            idPropriedade_FK: idPropriedade,
          },
        },
      },
    };

    const [total, tratosDb] = await Promise.all([
      tx.tratosculturais.count({ where: whereClause }),
      tx.tratosculturais.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          eventosagricolas: { eventos: { dataInicio: 'desc' } },
        },
        include: {
          tipostratos: true,
          tratosinsumos: { include: { insumos: true } },
          eventosagricolas: {
            include: {
              eventos: {
                include: {
                  safras: true,
                  pessoaseventos: { include: { pessoas: true } },
                  transacoesfinanceiras: { include: { formaspgto: true, despesas: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    const tratosMapeados = await Promise.all(tratosDb.map((trato) => this.mapToEntity(trato, tx as PrismaClient)));
    return { total, tratos: tratosMapeados };
  }

  public async listarTodosTalhao(
    idTalhao: number,
    idPropriedade: number,
    pagina?: number,
    status?: StatusTrato,
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<{ total: number; tratos: TratoCultural[] }> {

    const limite = 25;
    const skip = pagina ? (pagina - 1) * limite : undefined;
    const take = pagina ? limite : undefined;

    const eventosConditions: Prisma.eventosWhereInput[] = [];
    const dataAtual = new Date();

    if (status === StatusTrato.AGENDADO) {
      eventosConditions.push({ dataInicio: { gt: dataAtual }, dataFim: null });
    } else if (status === StatusTrato.EM_ANDAMENTO) {
      eventosConditions.push({ dataInicio: { lte: dataAtual }, dataFim: null });
    } else if (status === StatusTrato.FINALIZADO) {
      eventosConditions.push({ dataFim: { not: null } });
    }

    const whereClause: Prisma.tratosculturaisWhereInput = {
      eventosagricolas: {
        idTalhao_FK: idTalhao,
        talhoes: { idPropriedade_FK: idPropriedade },
        eventos: eventosConditions.length > 0 ? { AND: eventosConditions } : undefined,
      },
    };

    const [total, tratosDb] = await Promise.all([
      tx.tratosculturais.count({ where: whereClause }),
      tx.tratosculturais.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: {
          eventosagricolas: { eventos: { dataInicio: 'desc' } },
        },
        include: {
          tipostratos: true,
          tratosinsumos: { include: { insumos: true } },
          eventosagricolas: {
            include: {
              eventos: {
                include: {
                  safras: true,
                  pessoaseventos: { include: { pessoas: true } },
                  transacoesfinanceiras: { include: { formaspgto: true, despesas: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    const tratosMapeados = await Promise.all(tratosDb.map((trato) => this.mapToEntity(trato, tx as PrismaClient)));
    return { total, tratos: tratosMapeados };
  }

  public async listarTodosTalhaoSafra(
    idTalhao: number,
    idSafra: number,
    idPropriedade: number,
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<TratoCultural[]> {
    const tratos = await tx.tratosculturais.findMany({
      where: {
        eventosagricolas: {
          idTalhao_FK: idTalhao,
          talhoes: {
            idPropriedade_FK: idPropriedade,
          },
          eventos: {
            safras: {
              idSafra_PK: idSafra,
              idPropriedade_FK: idPropriedade,
            },
          },
        },
      },
      include: {
        tipostratos: true,
        tratosinsumos: {
          include: { insumos: true },
        },
        eventosagricolas: {
          include: {
            eventos: {
              include: {
                safras: true,
                pessoaseventos: {
                  include: { pessoas: true },
                },
                transacoesfinanceiras: {
                  include: { formaspgto: true, despesas: true },
                },
              },
            },
          },
        },
      },
    });

    return await Promise.all(
      tratos.map((trato) => this.mapToEntity(trato, tx))
    );
  }

  public async buscarTiposTratos(): Promise<
    { id: number; descricao: string }[]
  > {
    const tiposTratos = await this.prisma.tipostratos.findMany();

    return tiposTratos.map((tipoTrato) => ({
      id: tipoTrato.idTipoTrato_PK,
      descricao: tipoTrato.descricao,
    }));
  }

  public async atualizarDescricao(
    trato: TratoCultural,
  ): Promise<void> {
    await this.eventoRepo.atualizarDescricao(trato);
  };

  public async inserirInsumos(trato: TratoCultural): Promise<void> {
    if (!trato.insumosUtilizados || trato.insumosUtilizados.length === 0) {
      return;
    }

    const idTrato = trato.id!;

    const insumosNoBanco = await this.prisma.tratosinsumos.findMany({
      where: { idTrato_PFK: idTrato },
      select: { idInsumo_PFK: true, qtdUsada: true },
    });

    const mapaExistentes = new Map<number, number>();
    for (const item of insumosNoBanco) {
      mapaExistentes.set(item.idInsumo_PFK, Number(item.qtdUsada));
    }

    type InsertPayload = { idTrato_PFK: number; idInsumo_PFK: number; qtdUsada: number };
    type UpdatePayload = { idInsumo_PFK: number; novaQtdTotal: number };

    const novosInsumosParaInserir: InsertPayload[] = [];
    const insumosParaAtualizar: UpdatePayload[] = [];

    for (const tratoInsumo of trato.insumosUtilizados) {
      const idInsumo = tratoInsumo.insumo.id!;
      const qtdSendoAdicionada = tratoInsumo.qtdUsada;

      if (mapaExistentes.has(idInsumo)) {
        const qtdAnterior = mapaExistentes.get(idInsumo)!;
        const qtdTotalAtualizada = qtdAnterior + qtdSendoAdicionada;

        insumosParaAtualizar.push({
          idInsumo_PFK: idInsumo,
          novaQtdTotal: qtdTotalAtualizada,
        });
      } else {
        novosInsumosParaInserir.push({
          idTrato_PFK: idTrato,
          idInsumo_PFK: idInsumo,
          qtdUsada: qtdSendoAdicionada,
        });
      }
    }

    await this.prisma.$transaction(async (tx) => {
      for (const atualizacao of insumosParaAtualizar) {
        await tx.tratosinsumos.updateMany({
          where: {
            idTrato_PFK: idTrato,
            idInsumo_PFK: atualizacao.idInsumo_PFK,
          },
          data: {
            qtdUsada: atualizacao.novaQtdTotal,
          },
        });
      }
      if (novosInsumosParaInserir.length > 0) {
        await tx.tratosinsumos.createMany({
          data: novosInsumosParaInserir,
        });
      }
    });
  };

  public async alterarInicioTrato(trato: TratoCultural): Promise<void> {
    await this.eventoRepo.editarInicio(trato);
  };
  
  public async finalizarTrato(trato: TratoCultural): Promise<void> {
    await this.eventoRepo.finalizar(trato);
  };

  public async editarResponsaveis(trato: TratoCultural): Promise<void> {
    await this.eventoRepo.editarResponsaveis(trato, this.prisma);
  };

  public async excluirTransacoes(trato: TratoCultural): Promise<void> {
    await this.eventoRepo.excluirTransacoes(trato);
  };

  public async excluirInsumos(trato: TratoCultural): Promise<void> {
    await this.prisma.tratosinsumos.deleteMany({
      where: {
        idTrato_PFK: trato.id,
        idInsumo_PFK: { notIn: trato.insumosUtilizados!.map((tratoInsumo) => tratoInsumo.insumo.id as number) },
      },
    });
  };

  public async excluir(trato: TratoCultural): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.tratosinsumos.deleteMany({
        where: { idTrato_PFK: trato.id },
      });
      await tx.tratosculturais.delete({ where: { idEventoAgricola_PFK: trato.id } });
      await this.eventoAgricolaRepo.excluir(trato, tx);
      await this.eventoRepo.excluir(trato, tx);
    })
  }

  private async mapToEntity(
    tratoDB: TratoCulturalPayload,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<TratoCultural> {
    const eventoBase = tratoDB.eventosagricolas.eventos;

    const safra = new Safra({
      id: eventoBase.safras.idSafra_PK,
      idPropriedade: eventoBase.safras.idPropriedade_FK,
      dataInicio: eventoBase.safras.dataInicio,
      dataFim: eventoBase.safras.dataFim,
    });

    const transacoes: Despesa[] = [];

    for (const tf of eventoBase.transacoesfinanceiras) {
      const despesa = await this.despesaRepo.buscarPorId(
        tf.despesas!.idTransacaoFinanceira_PFK,
        prisma
      );

      if (despesa) {
        transacoes.push(despesa);
      }
    };

    const responsaveis: PessoaBase[] = [];

    for (const pe of eventoBase.pessoaseventos) {
      const pessoaInstancia = await this.pessoaBaseRepo.buscarPorId(
        pe.pessoas.idPessoa_PK,
        prisma
      );

      if (pessoaInstancia) {
        responsaveis.push(pessoaInstancia);
      }
    }

    const tratoCultural = new TratoCultural(
      tratoDB.idEventoAgricola_PFK,
      tratoDB.eventosagricolas.idTalhao_FK,
      new Date(eventoBase.dataInicio),
      eventoBase.dataFim ? new Date(eventoBase.dataFim) : null,
      eventoBase.descricao,
      new Date(eventoBase.dataCadastro),
      safra,
      transacoes,
      responsaveis,
      tratoDB.tipostratos.descricao as TipoTrato,
      [],
    );
    

    if (tratoDB.tratosinsumos && tratoDB.tratosinsumos.length > 0) {
      tratoDB.tratosinsumos.forEach((ti: TratoInsumoPayload) => {
        const insumo = new Insumo(
          ti.insumos.idInsumo_PK,
          ti.insumos.idProprietario_FK,
          ti.insumos.descricao,
          ti.insumos.medida as MedidaInsumo,
        );

        const tratoInsumo = new TratoInsumo(insumo, ti.qtdUsada);

        tratoCultural.insumosUtilizados
          ? tratoCultural.insumosUtilizados.push(tratoInsumo)
          : null;
      });
    }

    return tratoCultural;
  }
}

export default TratoCulturalRepository;
