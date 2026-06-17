import { PrismaClient } from "@prisma/client";
import Talhao, { Especie } from "./talhao.entity";
import Tamanho from "../../shared/domain/tamanho/tamanho.entity";
import { ITalhaoCompletoModel } from "./talhao.model";

class TalhaoRepository {
  constructor(private prisma: PrismaClient) {}

  async cadastrar(talhao: Talhao, variedadesIds: number[]): Promise<number> {
    const talhaoDb = await this.prisma.talhoes.create({
      data: {
        nome: talhao.nome,
        qtdPeCafe: talhao.qtdPeCafe,
        especie: talhao.especie,
        dataInicio: talhao.dataInicio,
        arquivado: talhao.arquivado ? 1 : 0,
        propriedades: {
          connect: {
            idPropriedade_PK: talhao.idPropriedade,
          },
        },
        tamanhos: {
          create: {
            valor: talhao.tamanho.valor,
            medida: talhao.tamanho.medida,
          },
        },
        variedadestalhoes: {
          create: variedadesIds.map((id) => ({
            idVariedade_PFK: id,
          })),
        },
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
    });

    return talhaoDb.idTalhao_PK;
  };

  public async buscarAtivosPorPropriedade(
    idPropriedade: number,
  ): Promise<Talhao[]> {
    const talhoesDb = await this.prisma.talhoes.findMany({
      where: {
        idPropriedade_FK: idPropriedade,
        arquivado: 0,
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
    });

    return talhoesDb.map((db) =>
      this.mapToDomain(db as unknown as ITalhaoCompletoModel),
    );
  };

  async buscarPorId(id: number): Promise<Talhao | null> {
    const talhaoDb = (await this.prisma.talhoes.findFirst({
      where: {
        idTalhao_PK: id,
        arquivado: 0,
      },
      include: {
        tamanhos: true,
        variedadestalhoes: {
          include: { variedades: true },
        },
      },
    })) as unknown as ITalhaoCompletoModel | null;

    if (!talhaoDb) return null;
    return this.mapToDomain(talhaoDb);
  };

  async atualizarEncerramento(talhao: Talhao): Promise<void> {
    if (!talhao.id) throw new Error("ID do talhão é obrigatório.");

    await this.prisma.talhoes.update({
      where: { idTalhao_PK: talhao.id },
      data: {
        dataFim: talhao.dataFim,
        arquivado: talhao.arquivado ? 1 : 0,
      },
    });
  };

  private mapToDomain(model: ITalhaoCompletoModel): Talhao {
    const tamanhoDomain = new Tamanho(
      model.tamanhos.valor,
      model.tamanhos.medida,
    );

    const descricoesVariedades = model.variedadestalhoes.map(
      (vt) => vt.variedades.descricao,
    );

    return new Talhao(
      model.idTalhao_PK,
      model.nome,
      tamanhoDomain,
      model.idPropriedade_FK,
      model.qtdPeCafe,
      model.especie as Especie,
      descricoesVariedades,
      null,
      model.dataInicio,
      model.dataFim,
      model.arquivado,
    );
  }
}
export default TalhaoRepository;
