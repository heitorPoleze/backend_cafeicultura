import { Prisma, PrismaClient } from "@prisma/client";
import Fornecedor from "./fornecedor.entity";
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";
import PessoaFisica from "../pessoafisica.entity";
import PessoaJuridica from "../pessoajuridica.entity";

class FornecedorRepository {
  constructor(
    private prisma: PrismaClient,
    private pessoaRepo: PessoaRepository,
  ) {}
  public async buscarFornecedoresPorAdministrador(idAdministrador: number,pagina: number, limite: number): Promise<{ pagina: number; limite: number; dados: Fornecedor[] }> {
    const fornecedoresDb = await this.prisma.fornecedores.findMany({
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
    const fornecedores: Fornecedor[] = [];
    for (const f of fornecedoresDb) {
      const pessoa = await this.buscarPorId(f.idFornecedor_PFK);
      if (pessoa) {
        fornecedores.push(pessoa);
      }
    }
    return {
      pagina,
      limite,
      dados: fornecedores
    };
  }
  public async salvarComTransacao(f: Fornecedor): Promise<number> {
    // Inicia a transação (Unit of Work)
    return await this.prisma.$transaction(async (tx) => {
      // 1. Delega a criação da Pessoa (Física/Jurídica) passando o 'tx'
      const id = await this.pessoaRepo.salvar(f.pessoa, tx);

      // 2. O próprio repositório salva sua entidade principal
      await tx.fornecedores.create({
        data: { idFornecedor_PFK: id },
      });

      return id;
    });
  };

  public async buscarPorId(id: number): Promise<Fornecedor | null> {
     if(!id || id <= 0 || !Number.isInteger(id)) {
      throw new Error("ID_INVALIDO");
    }
    const f = await this.prisma.fornecedores.findUnique({
      where: { idFornecedor_PFK: id },
    });

    if (!f) return null;

    const p = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: {
        pessoasfisicas: true,
        pessoasjuridicas: true,
        enderecos: true
      },
    });

    if (!p) return null;

    const e = p.enderecos;

    const endereco = e
      ? new Endereco(
          e.logradouro,
          e.bairro,
          e.cidade,
          e.uf,
          e.pais,
          e.cep,
          e.idEndereco_PK,
        )
      : null;

    const tipoPessoa = p.pessoasfisicas ? "fisica" : "juridica";

    const dados = {
      id: f.idFornecedor_PFK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf,
      razaoSocial: p.pessoasjuridicas?.razaoSocial,
      cnpj: p.pessoasjuridicas?.cnpj,
      inscEstadual: p.pessoasjuridicas?.inscEstadual,
    };

    // 4. Delega a criação para a Factory
    const pessoa = PessoaFactory.criarPessoa(tipoPessoa, dados);

    return new Fornecedor(pessoa);
  };

   public async excluir(fornecedor: Fornecedor): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.fornecedores.delete({
          where: { idFornecedor_PFK: fornecedor.pessoa.id! }
        });
        if (fornecedor.pessoa instanceof PessoaJuridica) {
          await tx.pessoasjuridicas.delete({
            where: { idPeJuridica_PFK: fornecedor.pessoa.id! }
          });
        } else if (fornecedor.pessoa instanceof PessoaFisica) {
          await tx.pessoasfisicas.delete({
            where: { idPeFisica_PFK: fornecedor.pessoa.id! }
          });
        }
        await this.pessoaRepo.excluirPessoa(fornecedor.pessoa, tx);
        if (!await this.pessoaRepo.removerEndereco(fornecedor.pessoa.id!, tx)) {
          throw new Error("ERRO_REMOVER_ENDERECO");
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("FORNECEDOR_POSSUI_ASSOCIACOES");
      }
      throw error;
    }
  };
}

export default FornecedorRepository;
