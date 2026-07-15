import { Prisma, PrismaClient } from '@prisma/client';
import CompraInsumo from './comprainsumo.entity';

class CompraInsumoRepository {
    constructor(private readonly prisma: PrismaClient) {}

    public async cadastrar(
        compra: CompraInsumo, 
        idDespesa: number, 
        tx: Prisma.TransactionClient
    ): Promise<number> {
        
        const compraDB = await tx.comprasinsumos.create({
            data: {
                idInsumo_FK: compra.insumo.id as number,
                idDespesa_FK: idDespesa, 
                qtdComprada: compra.qtdComprada
            }
        });

        return compraDB.idCompra_PK;
    }
}

export default CompraInsumoRepository;