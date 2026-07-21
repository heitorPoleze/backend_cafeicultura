import { Prisma, PrismaClient } from "@prisma/client";
import TransacaoFinanceiraRepository from "../../shared/domain/transacaofinanceira/transacaofinanceira.repository";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import Despesa from "./despesa.entity";
import { FormaPagamento, TipoOperacao } from "../../shared/domain/transacaofinanceira/transacaofinanceira.entity";

const despesaInclude = {
  transacoesfinanceiras: {
    include: {
      formaspgto: true, 
    }
  }
} satisfies Prisma.despesasInclude;

type DespesaPayload = Prisma.despesasGetPayload<{
  include: typeof despesaInclude;
}>;

class DespesaRepository {
  constructor(
    private prisma: PrismaClient,
    private transacaoRepo: TransacaoFinanceiraRepository,
    private pessoaRepo: PessoaRepository 
  ) {};

  public async cadastrar(
    despesa: Despesa,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const executarOperacoes = async (
      clientePrisma: Prisma.TransactionClient,
    ) => {
      const idTransacao = await this.transacaoRepo.cadastrar(
        despesa,
        despesa.beneficiado.id!,
        clientePrisma,
      );

      await clientePrisma.despesas.create({
        data: {
          idTransacaoFinanceira_PFK: idTransacao,
          descricao: despesa.descricao || '',
        },
      });

      return idTransacao;
    };

    if (tx) {
      return await executarOperacoes(tx);
    } else {
      return await this.prisma.$transaction(async (novoTx) => {
        return await executarOperacoes(novoTx);
      });
    };
  };


  public async buscarPorId(id: number, tx?: Prisma.TransactionClient): Promise<Despesa | null> {
    const despesaDB = await (tx ?? this.prisma).despesas.findUnique({
      where: { 
        idTransacaoFinanceira_PFK: id 
      },
      include: despesaInclude, 
    });

    if (!despesaDB) return null;

    return await this.mapToEntity(despesaDB, tx);
  };
  
  public async listarDespesasProprietario(idProprietario: number): Promise<Despesa[]> {
    const despesasDB = await this.prisma.despesas.findMany({
      where: {
        transacoesfinanceiras: {
          propriedades: {
            idProprietario_FK: idProprietario
          }
        }
      },
      include: despesaInclude,
      orderBy: {
        transacoesfinanceiras: {
          dataHora: 'desc' 
        }
      }
    });

    const despesas = await Promise.all(
      despesasDB.map((d) => this.mapToEntity(d))
    );

    return despesas.filter((d): d is Despesa => d !== null);
  }

  public async listarDespesasPropriedade(idPropriedade: number): Promise<Despesa[]> {
    const despesasDB = await this.prisma.despesas.findMany({
      where: {
        transacoesfinanceiras: {
          idPropriedade_FK: idPropriedade
        }
      },
      include: despesaInclude,
      orderBy: {
        transacoesfinanceiras: {
          dataHora: 'desc' 
        }
      }
    });

    const despesas = await Promise.all(
      despesasDB.map((d) => this.mapToEntity(d))
    );

    return despesas.filter((d): d is Despesa => d !== null);
  }

  private async mapToEntity(despesaDB: DespesaPayload, prisma?: Prisma.TransactionClient): Promise<Despesa | null> {
    const transacaoBase = despesaDB.transacoesfinanceiras;

    const beneficiado = await this.pessoaRepo.buscarPorId(transacaoBase.idPessoa_FK, prisma);
    
    if (!beneficiado) return null; 

    return new Despesa(
      despesaDB.idTransacaoFinanceira_PFK,
      transacaoBase.idEvento_FK,
      transacaoBase.idPropriedade_FK,
      new Date(transacaoBase.dataHora),
      Number(transacaoBase.valor),
      transacaoBase.formaspgto.descricao as FormaPagamento,
      transacaoBase.tipoOperacao as TipoOperacao,
      beneficiado, 
      despesaDB.descricao
    );
  }

  public async excluir(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const executarOperacoes = async (
      clientePrisma: Prisma.TransactionClient,
    ) => {
      await clientePrisma.despesas.delete({
        where: { idTransacaoFinanceira_PFK: id },
      });
      await this.transacaoRepo.excluir(id, clientePrisma); 
    };

    if (tx) {
      await executarOperacoes(tx);
    } else {
      await this.prisma.$transaction(async (novoTx) => {
        await executarOperacoes(novoTx);
      });
    };
  };
};

export default DespesaRepository;