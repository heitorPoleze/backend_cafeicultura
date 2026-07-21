import { Prisma, PrismaClient } from "@prisma/client";
import TratoCultural, { TipoTrato } from "./tratocultural.entity";
import EventoAgricolaRepository from "../../shared/domain/evento/eventoagricola/eventoagricola.repository";
import EventoRepository from "../../shared/domain/evento/evento.repository";
import Safra from "../safra/safra.entity";
import Insumo, { MedidaInsumo } from "../../shared/domain/insumo/insumo.entity";
import TratoInsumo from "../../shared/domain/insumo/tratoinsumo/tratoinsumo.entity";
import PessoaBaseRepository from "../../shared/domain/pessoa/pessoa.repository";
import PessoaBase from "../../shared/domain/pessoa/pessoabase.entity";

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
  ) {}

  public async cadastrar(
    trato: TratoCultural,
    idTipoTrato: number,
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
      return id;
    });
  }

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
  ): Promise<TratoCultural[]> {
    const tratos = await this.prisma.tratosculturais.findMany({
      where: {
        eventosagricolas: {
          eventos: {
            safras: {
              idPropriedade_FK: idPropriedade,
              arquivada: false,
            },
          },
        },
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
              },
            },
          },
        },
      },
    });

    return await Promise.all(tratos.map((trato) => this.mapToEntity(trato)));
  }

  public async listarTodosSafra(
    idSafra: number,
    idPropriedade: number,
  ): Promise<TratoCultural[]> {
    const tratos = await this.prisma.tratosculturais.findMany({
      where: {
        eventosagricolas: {
          eventos: {
            safras: {
              idSafra_PK: idSafra,
              idPropriedade_FK: idPropriedade,
              arquivada: false,
            },
          },
        },
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
              },
            },
          },
        },
      },
    });

    return await Promise.all(tratos.map((trato) => this.mapToEntity(trato)));
  }

  public async listarTodosTalhao(
    idTalhao: number,
    idPropriedade: number,
  ): Promise<TratoCultural[]> {
    const tratos = await this.prisma.tratosculturais.findMany({
      where: {
        eventosagricolas: {
          idTalhao_FK: idTalhao,
          talhoes: {
            idPropriedade_FK: idPropriedade,
          },
          eventos: {
            safras: {
              idPropriedade_FK: idPropriedade,
              arquivada: false,
            },
          },
        },
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
              },
            },
          },
        },
      },
    });

    return await Promise.all(tratos.map((trato) => this.mapToEntity(trato)));
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

  public async finalizarTrato(trato: TratoCultural): Promise<void> {
    await this.eventoRepo.finalizar(trato);
  }

  public async confirmarTrato(trato: TratoCultural): Promise<void> {
    await this.eventoRepo.confirmar(trato);
  }

  private async mapToEntity(
    tratoDB: TratoCulturalPayload,
  ): Promise<TratoCultural> {
    const eventoBase = tratoDB.eventosagricolas.eventos;

    const safra = new Safra({
      id: eventoBase.safras.idSafra_PK,
      idPropriedade: eventoBase.safras.idPropriedade_FK,
      dataInicio: eventoBase.safras.dataInicio,
      dataFim: eventoBase.safras.dataFim,
      arquivada: eventoBase.safras.arquivada,
    });

    const responsaveis: PessoaBase[] = [];

    for (const pe of eventoBase.pessoaseventos) {
      const pessoaInstancia = await this.pessoaBaseRepo.buscarPorId(
        pe.pessoas.idPessoa_PK,
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
      [],
      responsaveis,
      eventoBase.confirmado === 1 ? true : false,
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
