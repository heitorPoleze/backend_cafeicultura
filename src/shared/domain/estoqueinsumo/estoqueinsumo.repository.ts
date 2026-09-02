import { Prisma } from '@prisma/client';
import EstoqueInsumo from './estoqueinsumo.entity';

class EstoqueInsumoRepository {
    async cadastrar(estoqueInsumo: EstoqueInsumo, tx: Prisma.TransactionClient): Promise<number> {
        return await tx.estoqueinsumos.create({
            data: {
                idInsumo_FK: estoqueInsumo.idInsumo,
                idPropriedade_FK: estoqueInsumo.idPropriedade,
                quantidade: estoqueInsumo.quantidade
            }
        }).then((estoqueInsumoDB) => {
            return estoqueInsumoDB.idEstInsumo_PK;
        });
    };

    async buscarEstoque(idInsumo: number, idPropriedade: number, idProprietario: number, tx: Prisma.TransactionClient): Promise<EstoqueInsumo | null> {
        const estoqueInsumoDB = await tx.estoqueinsumos.findFirst({
            where: {
                idInsumo_FK: idInsumo,
                propriedades: { 
                    idPropriedade_PK: idPropriedade,
                    proprietarios: {
                        idProprietario_PFK: idProprietario
                    }
                },
                insumos: {
                    idProprietario_FK: idProprietario
                },
            },
        });
        if (!estoqueInsumoDB) return null;
        return new EstoqueInsumo(estoqueInsumoDB.idEstInsumo_PK, estoqueInsumoDB.idInsumo_FK, estoqueInsumoDB.idPropriedade_FK, estoqueInsumoDB.quantidade);
    };

    async atualizar(estoqueInsumo: EstoqueInsumo, tx: Prisma.TransactionClient): Promise<void> {
        await tx.estoqueinsumos.update({
            where: { idEstInsumo_PK: estoqueInsumo.id},
            data: { quantidade: estoqueInsumo.quantidade }
        });
    };

    async excluir(estoqueInsumo: EstoqueInsumo, tx: Prisma.TransactionClient): Promise<void> {
        await tx.estoqueinsumos.delete({ where: { idEstInsumo_PK: estoqueInsumo.id } });
    };
}

export default EstoqueInsumoRepository;