import { Prisma, PrismaClient } from '@prisma/client';
import Insumo, { MedidaInsumo } from './insumo.entity';

class InsumoRepository {
    constructor(private readonly prisma: PrismaClient) {};

    public async cadastrar(insumo: Insumo, tx: Prisma.TransactionClient): Promise<Insumo> {
        const insumoDB = await tx.insumos.create({
            data: {
                idProprietario_FK: insumo.idProprietario,
                descricao: insumo.descricao,
                medida: insumo.medida
            }
        });

        return new Insumo(insumoDB.idInsumo_PK, insumoDB.idProprietario_FK, insumoDB.descricao, insumoDB.medida as MedidaInsumo);
    };

    public async buscarPorId(idInsumo: number, idUsuario: number, tx: Prisma.TransactionClient = this.prisma): Promise<Insumo | null> {
        const insumoDB = await tx.insumos.findUnique({
            where: { 
                idInsumo_PK: idInsumo,
                idProprietario_FK: idUsuario
            },
        });

        if (!insumoDB) return null;
        return new Insumo(insumoDB.idInsumo_PK, insumoDB.idProprietario_FK, insumoDB.descricao, insumoDB.medida as MedidaInsumo);
    };

    public async buscarPorDescricao(descricao: string, idUsuario: number, tx: Prisma.TransactionClient): Promise<Insumo | null> {
        const insumoDB = await tx.insumos.findFirst({
            where: {
                idProprietario_FK: idUsuario,
                descricao: {
                    contains: descricao
                },
            },
        });

        if (!insumoDB) return null;
        return new Insumo(insumoDB.idInsumo_PK, insumoDB.idProprietario_FK, insumoDB.descricao, insumoDB.medida as MedidaInsumo);
    };

    public async buscarTodos(idUsuario: number, tx: Prisma.TransactionClient): Promise<Insumo[]> {
        const insumosDB = await tx.insumos.findMany({
            where: {
                idProprietario_FK: idUsuario,
            },
            orderBy: {
                descricao: 'asc'
            },
        });

        return insumosDB.map(insumoDB => new Insumo(insumoDB.idInsumo_PK, insumoDB.idProprietario_FK, insumoDB.descricao, insumoDB.medida as MedidaInsumo));
    };
}

export default InsumoRepository;