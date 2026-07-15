import { Prisma, PrismaClient } from '@prisma/client';
import Insumo, { MedidaInsumo } from './insumo.entity';

class InsumoRepository {
    constructor(private readonly prisma: PrismaClient) {};

    public async cadastrar(insumo: Insumo, tx?: Prisma.TransactionClient): Promise<number> {
        const client = tx || this.prisma;

        const insumoDB = await client.insumos.create({
            data: {
                descricao: insumo.descricao,
                medida: insumo.medida
            }
        });

        return insumoDB.idInsumo_PK;
    };

    public async buscarPorId(idInsumo: number): Promise<Insumo | null> {
        const insumoDB = await this.prisma.insumos.findUnique({
            where: { idInsumo_PK: idInsumo }
        });

        if (!insumoDB) return null;
        return new Insumo(insumoDB.idInsumo_PK, insumoDB.descricao, insumoDB.medida as MedidaInsumo);
    };

    public async buscarPorDescricao(descricao: string): Promise<Insumo | null> {
        const insumoDB = await this.prisma.insumos.findFirst({
            where: {
                descricao: {
                    contains: descricao
                },
            },
        });

        if (!insumoDB) return null;
        return new Insumo(insumoDB.idInsumo_PK, insumoDB.descricao, insumoDB.medida as MedidaInsumo);
    };

    public async verificarExistente(descricao: string): Promise<boolean> {
        const insumo = await this.prisma.insumos.findFirst({
            where: {
                descricao: {
                    equals: descricao
                },
            },
        })
        return !!insumo;
    };

    public async buscarTodos(): Promise<Insumo[]> {
        const insumosDB = await this.prisma.insumos.findMany({
            orderBy: {
                descricao: 'asc'
            },
        });

        return insumosDB.map(insumoDB => new Insumo(insumoDB.idInsumo_PK, insumoDB.descricao, insumoDB.medida as MedidaInsumo));
    };
}

export default InsumoRepository;