import { Prisma, PrismaClient } from "@prisma/client";
import Prestador from "./prestador.entity";
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";
import PessoaDTO from '../pessoa.dto';

class PrestadorRepository {
  constructor(
    private prisma: PrismaClient,
    private pessoaRepo: PessoaRepository,
  ) { }

  public async salvarComTransacao(p: Prestador): Promise<number> {
    return await this.prisma.$transaction(async (tx) => {
      const id = await this.pessoaRepo.salvar(p.pessoa, tx);
      await tx.prestadoresdeservico.create({
        data: { idPeFisica_PFK: id },
      });

      return id;
    });
  };
  public async buscarPrestadoresPorAdministrador(idAdministrador: number): Promise<{ dados: Prestador[] }> {
    const prestadoresDb = await this.prisma.prestadoresdeservico.findMany({
      include: {
        pessoas: true
      },
      where: {
        pessoas: {
          idAdministrador_FK: idAdministrador
        }
      }
    });
    const prestadores: Prestador[] = [];
    for (const p of prestadoresDb) {
      const pessoa = await this.buscarPorId(p.idPeFisica_PFK);
      if (pessoa) {
        prestadores.push(pessoa);
      }
    }
    return { dados: prestadores };
  }

  public async buscarPorId(id: number): Promise<Prestador | null> {
    if (!id || id <= 0 || !Number.isInteger(id)) {
      throw new Error("ID_INVALIDO");
    }
    const m = await this.prisma.prestadoresdeservico.findUnique({
      where: { idPeFisica_PFK: id },
    });

    if (!m) return null;

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
      ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
      : null;

    const isPF = !!p.pessoasfisicas;

    const dados: PessoaDTO = {
      id: p.idPessoa_PK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,

      nome: isPF ? p.pessoasfisicas!.nome : undefined,
      cpf: isPF ? (p.pessoasfisicas!.cpf ?? null) : null,

      razaoSocial: !isPF ? p.pessoasjuridicas!.razaoSocial : undefined,
      cnpj: !isPF ? (p.pessoasjuridicas!.cnpj ?? null) : null,
      inscrEstadual: !isPF ? (p.pessoasjuridicas!.inscEstadual ?? null) : null,
    };

    const pessoa = PessoaFactory.criarPessoa(isPF ? "fisica" : "juridica", dados);

    return new Prestador(pessoa);
  };

  public async excluir(prestador: Prestador): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.prestadoresdeservico.delete({
          where: { idPeFisica_PFK: prestador.pessoa.id! }
        });
        await tx.pessoasfisicas.delete({
          where: { idPeFisica_PFK: prestador.pessoa.id! }
        });
        await this.pessoaRepo.excluirPessoa(prestador.pessoa, tx);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("PRESTADOR_POSSUI_ASSOCIACOES");
      }
      throw error;
    }
  };
}

export default PrestadorRepository;