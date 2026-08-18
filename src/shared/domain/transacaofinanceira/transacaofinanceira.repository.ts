import { Prisma, PrismaClient } from '@prisma/client';
import TransacaoFinanceira from './transacaofinanceira.entity';

class TransacaoFinanceiraRepository {
    constructor(private prisma: PrismaClient) {}

    public async cadastrar(
        transacao: TransacaoFinanceira, 
        idPessoa: number,
        tx: Prisma.TransactionClient
    ): Promise<number> {
        
        const formaPgtoDB = await tx.formaspgto.findFirst({
            where: { 
                descricao: transacao.formaPagamento 
            }
        });

        if (!formaPgtoDB) {
            throw new Error(`FORMA_NAO_ENCONTRADA`);
        };
        
        const transacaoDB = await tx.transacoesfinanceiras.create({
            data: {
                idPropriedade_FK: transacao.idPropriedade,
                dataHora: transacao.dataHora,
                valor: transacao.valor,
                tipoOperacao: transacao.tipoOperacao, 
                idPessoa_FK: idPessoa,
                idFormaPgto_FK: formaPgtoDB.idFormaPgto_PK, 
                idEvento_FK: transacao.idEvento
            }
        });
        return transacaoDB.idTransacaoFinanceira_PK; 
    };

    public async buscarMetodosPagamentos(): Promise<{ id: number; descricao: string }[]> {
        const metodos = await this.prisma.formaspgto.findMany({
            select: {
                idFormaPgto_PK: true,
                descricao: true
            },
            orderBy: {
                descricao: 'asc'
            }
        });

        return metodos.map(metodo => ({
            id: metodo.idFormaPgto_PK,
            descricao: metodo.descricao
        }));
    };
    
    public async excluir(id: number, tx: Prisma.TransactionClient): Promise<void> {
        await tx.transacoesfinanceiras.delete({ where: { idTransacaoFinanceira_PK: id } });
    };
    public async excluirPorEvento(idEvento: number, tx: Prisma.TransactionClient): Promise<void> {
        await tx.transacoesfinanceiras.deleteMany({ where: { idEvento_FK: idEvento } });
    };
};

export default TransacaoFinanceiraRepository;