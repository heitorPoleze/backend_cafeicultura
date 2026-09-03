import { Prisma, PrismaClient } from "@prisma/client";
import Meeiro from "./meeiro.entity";
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";

class MeeiroRepository {
  constructor(
    private prisma: PrismaClient,
    private pessoaRepo: PessoaRepository,
  ) {}

  public async salvarComTransacao(m: Meeiro): Promise<number> {
    // Inicia a transação (Unit of Work)
    return await this.prisma.$transaction(async (tx) => {
      // 1. Delega a criação da Pessoa (Física) passando o 'tx'
      const id = await this.pessoaRepo.salvar(m.pessoa, tx);

      // 2. O próprio repositório salva sua entidade principal
      await tx.meeiros.create({
        data: { idPeFisica_PFK: id },
      });

      return id;
    });
  };
  public async buscarMeeirosPorAdministrador(idAdministrador: number,pagina: number, limite: number): Promise<{ pagina: number; limite: number; dados: Meeiro[] }> {
    const meeirosDb = await this.prisma.meeiros.findMany({
      include: {
        pessoas: true
      },
      where: {
        pessoas: {
          idAdministrador_FK: idAdministrador
        }
      },
      skip: (pagina - 1) * limite,
      take: limite
    });
    const meeiros: Meeiro[] = [];
    for (const m of meeirosDb) {
      const pessoa = await this.buscarPorId(m.idPeFisica_PFK);
      if (pessoa) {
        meeiros.push(pessoa);
      }
    }
    return {
      pagina,
      limite,
      dados: meeiros
    };
  }
  public async buscarPorId(id: number): Promise<Meeiro | null> {
    if(!id || id <= 0 || !Number.isInteger(id)) {
      throw new Error("ID_INVALIDO");
    }
    const m = await this.prisma.meeiros.findUnique({
      where: { idPeFisica_PFK: id },
    });

    if (!m) return null;

    const p = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: {
        pessoasfisicas: true,
        enderecos: true
      },
    });

    if (!p) return null;

    const e = p.enderecos;

    const endereco = e
      ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
      : null;

    const dados = {
      id: m.idPeFisica_PFK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf
    };

    // 4. Delega a criação para a Factory
    const pessoa = PessoaFactory.criarPessoa("fisica", dados);

    return new Meeiro(pessoa);
  };

  public async excluir(meeiro: Meeiro): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.meeiros.delete({
          where: { idPeFisica_PFK: meeiro.pessoa.id! }
        });
        await tx.pessoasfisicas.delete({
          where: { idPeFisica_PFK: meeiro.pessoa.id! }
        });
        await this.pessoaRepo.excluirPessoa(meeiro.pessoa, tx);
        if (!await this.pessoaRepo.removerEndereco(meeiro.pessoa.id!, tx)) {
          throw new Error("ERRO_REMOVER_ENDERECO");
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("MEEIRO_POSSUI_ASSOCIACOES");
      }
      throw error;
    }
  };
}

export default MeeiroRepository;