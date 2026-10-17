import { Prisma, PrismaClient } from "@prisma/client";
import Diarista from "./diarista.entity";
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";
import PessoaDTO from "../pessoa.dto";

class DiaristaRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly pessoaRepo: PessoaRepository,
  ) {}

  public async salvarComTransacao(d: Diarista): Promise<number> {
    return await this.prisma.$transaction(async (tx) => {
      const id = await this.pessoaRepo.salvar(d.pessoa, tx);

      await tx.diaristas.create({
        data: {
          idPeFisica_PFK: id,
          valorHora: d.valorHora,
        },
      });

      return id;
    });
  }

  public async atualizarValorHora(id: number, valorHora: number): Promise<boolean> {
    const result = await this.prisma.diaristas.update({
      where: { idPeFisica_PFK: id },
      data: { valorHora: valorHora },
    });
    return !!result;
  }

  public async buscarPorId(id: number): Promise<Diarista | null> {
    if (!id || id <= 0 || !Number.isInteger(id)) {
      throw new Error("ID_INVALIDO");
    }

    const d = await this.prisma.diaristas.findUnique({
      where: { idPeFisica_PFK: id },
    });

    if (!d) return null;

    const p = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: {
        pessoasfisicas: true,
        enderecos: true,
        usuarios: true,
      },
    });

    if (!p || !p.pessoasfisicas) return null;

    const e = p.enderecos;
    const endereco = e
      ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
      : null;

    const dados: PessoaDTO = {
      id: p.idPessoa_PK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas.nome,
      cpf: p.pessoasfisicas.cpf ?? null,
      cnpj: null,
    };

    const pessoa = PessoaFactory.criarPessoa("fisica", dados);

    return new Diarista(pessoa, Number(d.valorHora));
  }

  public async listarDiaristas(idAdministrador: number): Promise<{ dados: Diarista[] }> {
    const pessoas = await this.prisma.pessoas.findMany({
      where: { idAdministrador_FK: idAdministrador },
      include: {
        pessoasfisicas: true,
        enderecos: true,
        usuarios: true,
      },
    });

    if (!pessoas || pessoas.length === 0) return { dados: [] };

    const pessoasIds = pessoas.map((p) => p.idPessoa_PK);

    const diaristasData = await this.prisma.diaristas.findMany({
      where: { idPeFisica_PFK: { in: pessoasIds } },
    });

    const diaristas: Diarista[] = [];

    pessoas.forEach((p) => {
      const diaristaInfo = diaristasData.find((d) => d.idPeFisica_PFK === p.idPessoa_PK);

      if (p.pessoasfisicas && diaristaInfo) {
        const e = p.enderecos;
        const endereco = e
          ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
          : null;

        const pessoa = PessoaFactory.criarPessoa("fisica", {
          id: p.idPessoa_PK,
          idAdministrador: p.idAdministrador_FK,
          dataCadastro: p.dataCadastro,
          endereco: endereco,
          nome: p.pessoasfisicas.nome,
          cpf: p.pessoasfisicas.cpf ?? null,
          cnpj: null,
        });

        diaristas.push(new Diarista(pessoa, Number(diaristaInfo.valorHora)));
      }
    });

    return { dados: diaristas };
  }

  public async excluir(diarista: Diarista): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.diaristas.delete({
          where: { idPeFisica_PFK: diarista.pessoa.id! },
        });
        await tx.pessoasfisicas.delete({
          where: { idPeFisica_PFK: diarista.pessoa.id! },
        });
        await this.pessoaRepo.excluirPessoa(diarista.pessoa, tx);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new Error("DIARISTA_POSSUI_ASSOCIACOES");
      }
      throw error;  
    }
  }
}

export default DiaristaRepository;