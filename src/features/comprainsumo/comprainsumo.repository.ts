import { Prisma, PrismaClient } from "@prisma/client";
import CompraInsumo from "./comprainsumo.entity";
import Insumo, { MedidaInsumo } from "../../shared/domain/insumo/insumo.entity";
import DespesaRepository from "../despesa/despesa.repository";

const compraInclude = {
  insumos: true
} satisfies Prisma.comprasinsumosInclude;

type CompraInsumoPayload = Prisma.comprasinsumosGetPayload<{
  include: typeof compraInclude;
}>;

class CompraInsumoRepository {
  constructor(
    private prisma: PrismaClient,
    private despesaRepo: DespesaRepository
  ) {};

  public async cadastrar(
    compra: CompraInsumo,
    idDespesaGerada: number,
    tx: Prisma.TransactionClient
  ): Promise<number> {
    const compraDB = await tx.comprasinsumos.create({
      data: {
        idInsumo_FK: compra.insumo.id!,
        idDespesa_FK: idDespesaGerada,
        qtdComprada: compra.qtdComprada
      }
    });
    return compraDB.idCompra_PK;
  }

  public async buscarPorId(id: number): Promise<CompraInsumo | null> {
    const compraDB = await this.prisma.comprasinsumos.findUnique({
      where: { idCompra_PK: id },
      include: compraInclude
    });

    if (!compraDB) return null;
    return await this.mapToEntity(compraDB);
  }

  public async listarPorPropriedade(idPropriedade: number): Promise<CompraInsumo[]> {
    const comprasDB = await this.prisma.comprasinsumos.findMany({
      where: {
        despesas: {
          transacoesfinanceiras: {
            idPropriedade_FK: idPropriedade
          }
        }
      },
      include: compraInclude
    });

    const compras = await Promise.all(comprasDB.map(c => this.mapToEntity(c)));
    return compras.filter((c): c is CompraInsumo => c !== null);
  }

  public async listarPorProprietario(idProprietario: number): Promise<CompraInsumo[]> {
    const comprasDB = await this.prisma.comprasinsumos.findMany({
      where: {
        despesas: {
          transacoesfinanceiras: {
            propriedades: {
              idProprietario_FK: idProprietario
            }
          }
        }
      },
      include: compraInclude
    });

    const compras = await Promise.all(comprasDB.map(c => this.mapToEntity(c)));
    return compras.filter((c): c is CompraInsumo => c !== null);
  }

  public async listarPorInsumoDescricao(descricao: string, idProprietario: number): Promise<CompraInsumo[]> {
    const comprasDB = await this.prisma.comprasinsumos.findMany({
      where: {
        insumos: {
          descricao: {
            contains: descricao,
          }
        },
        despesas: {
          transacoesfinanceiras: {
            propriedades: {
              idProprietario_FK: idProprietario
            }
          }
        }
      },
      include: compraInclude
    });

    const compras = await Promise.all(comprasDB.map(c => this.mapToEntity(c)));
    return compras.filter((c): c is CompraInsumo => c !== null);
  }

  private async mapToEntity(compraDB: CompraInsumoPayload): Promise<CompraInsumo | null> {
    const insumo = new Insumo(
      compraDB.insumos.idInsumo_PK, 
      compraDB.insumos.descricao, 
      compraDB.insumos.medida as MedidaInsumo
    );

    const despesa = await this.despesaRepo.buscarPorId(compraDB.idDespesa_FK);
    if (!despesa) return null;

    return new CompraInsumo(
      compraDB.idCompra_PK,
      insumo,
      despesa,
      compraDB.qtdComprada
    );
  }
}

export default CompraInsumoRepository;