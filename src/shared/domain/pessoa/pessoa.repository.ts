import PessoaFisica from "./pessoafisica.entity";
import PessoaJuridica from "./pessoajuridica.entity";
import Endereco from "../endereco/endereco.vo";
import PessoaFactory from "./pessoafactory.entity";
import PessoaBase from "./pessoabase.entity";
import PessoaDTO, { TipoPapel } from "./pessoa.dto";
import { Prisma, PrismaClient } from "@prisma/client";
import { ResultadoPaginacao } from "../../utils/pagination.dto";
import Formatador from "../../utils/Formatador";

const pessoaInclude = {
  pessoasfisicas: true,
  pessoasjuridicas: true,
  enderecos: true,
  funcionarios: true,
  diaristas: true,
} satisfies Prisma.pessoasInclude;

type PessoaPayload = Prisma.pessoasGetPayload<{
  include: typeof pessoaInclude;
}>;

const searchPessoas = {
  enderecos: true,
  pessoasfisicas: true,
  pessoasjuridicas: true,
  funcionarios: true,
  prestadoresdeservico: true,
  fornecedores: true,
  clientes: true,
  meeiros: true,
  diaristas: true,
} satisfies Prisma.pessoasInclude;

type PessoaSearchPayload = Prisma.pessoasGetPayload<{
  include: typeof searchPessoas;
}>;

class PessoaRepository {
  constructor(private readonly prisma: PrismaClient) { }

  private async buscarPessoaGenerica(
    where: Prisma.pessoasWhereInput,
    tx?: Prisma.TransactionClient
  ): Promise<PessoaDTO | null> {
    const db = tx ?? this.prisma;
    const pessoaDB = await db.pessoas.findFirst({
      where,
      include: pessoaInclude,
    });

    if (!pessoaDB) return null;
    return this.mapToPessoaDTOCompleto(pessoaDB);
  }

  private mapToPessoaDTOCompleto(p: PessoaPayload): PessoaDTO {
    const e = p.enderecos;
    const endereco = e
      ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
      : null;
    const isPF = !!p.pessoasfisicas;

    return {
      id: p.idPessoa_PK,
      idAdministrador: p.idAdministrador_FK,
      nome: isPF ? p.pessoasfisicas!.nome : undefined,
      cpf: isPF ? p.pessoasfisicas!.cpf : null,
      razaoSocial: !isPF ? p.pessoasjuridicas?.razaoSocial : undefined,
      cnpj: !isPF ? (p.pessoasjuridicas?.cnpj ?? null) : null,
      inscrEstadual: !isPF ? (p.pessoasjuridicas?.inscEstadual ?? null) : null,
      endereco: endereco,
      dataCadastro: p.dataCadastro,
    };
  }

  public async buscarPessoaPorId(pessoaId: number, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
    if (!pessoaId || pessoaId <= 0 || !Number.isInteger(pessoaId)) {
      throw new Error("ID_INVALIDO");
    }
    return await this.buscarPessoaGenerica({ idPessoa_PK: pessoaId }, tx);
  }

  public async buscarPessoaPorCpf(cpf: string, idAdministrador: number | null, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
    return await this.buscarPessoaGenerica(
      {
        idAdministrador_FK: idAdministrador,
        pessoasfisicas: { cpf: cpf },
      },
      tx
    );
  }

  public async buscarPessoaPorCnpj(cnpj: string, idAdministrador: number | null, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
    return await this.buscarPessoaGenerica(
      {
        idAdministrador_FK: idAdministrador,
        pessoasjuridicas: { cnpj: cnpj },
      },
      tx
    );
  }

  public async buscarPessoaPorInscricaoEstadual(ie: string, idAdministrador: number, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
    return await this.buscarPessoaGenerica(
      {
        idAdministrador_FK: idAdministrador,
        pessoasjuridicas: { inscEstadual: ie },
      },
      tx
    );
  }

  public async buscarPessoaPorCtps(ctps: string, idAdministrador: number, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
    return await this.buscarPessoaGenerica(
      {
        idAdministrador_FK: idAdministrador,
        funcionarios: { ctps: ctps },
      },
      tx
    );
  }

  public async verificarCpfExistente(cpf: string, idAdministrador: number | null, tx?: Prisma.TransactionClient): Promise<boolean> {
    const pessoa = await this.buscarPessoaPorCpf(cpf, idAdministrador, tx);
    return !!pessoa;
  }

  public async verificarCnpjExistente(cnpj: string, idAdministrador: number | null, tx?: Prisma.TransactionClient): Promise<boolean> {
    const pessoa = await this.buscarPessoaPorCnpj(cnpj, idAdministrador, tx);
    return !!pessoa;
  }

  public async verificarInscricaoEstadualExistente(ie: string, idAdministrador: number, tx?: Prisma.TransactionClient): Promise<boolean> {
    const pessoa = await this.buscarPessoaPorInscricaoEstadual(ie, idAdministrador, tx);
    return !!pessoa;
  }

  private montarFiltroPapel(papel: TipoPapel): Prisma.pessoasWhereInput {
    switch (papel) {
      case "cliente":
        return { clientes: { isNot: null } };
      case "fornecedor":
        return { fornecedores: { isNot: null } };
      case "funcionario":
        return { funcionarios: { isNot: null } };
      case "meeiro":
        return { meeiros: { isNot: null } };
      case "prestadordeservico":
        return { prestadoresdeservico: { isNot: null } };
      case "diarista":
        return { diaristas: { isNot: null } };
    }
  }

  public async verificarNomeDuplicadoNoPapel(
    nomeParaVerificar: string,
    papel: TipoPapel,
    idAdministrador: number,
    ignorarPessoaId?: number,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    const db = tx ?? this.prisma;
    const nomeAlvo = Formatador.normalizarNomePessoa(nomeParaVerificar);
    
    const registros = await db.pessoas.findMany({
      where: {
        idAdministrador_FK: idAdministrador,
        ...(ignorarPessoaId ? { idPessoa_PK: { not: ignorarPessoaId } } : {}),
        ...this.montarFiltroPapel(papel),
      },
      select: {
        pessoasfisicas: { select: { nome: true } },
        pessoasjuridicas: { select: { razaoSocial: true } },
      },
    });

    return registros.some((r) => {
      const nomeSalvo = r.pessoasfisicas?.nome ?? r.pessoasjuridicas?.razaoSocial ?? "";
      return Formatador.normalizarNomePessoa(nomeSalvo) === nomeAlvo;
    });
  }

  public async salvar(perfil: PessoaBase, tx: Prisma.TransactionClient): Promise<number> {
    const pessoa = await tx.pessoas.create({
      data: {
        dataCadastro: perfil.dataCadastro,
        idAdministrador_FK: perfil.idAdministrador ? perfil.idAdministrador : null,
      },
    });
    const id = pessoa.idPessoa_PK;

    if (perfil instanceof PessoaFisica) {
      await tx.pessoasfisicas.create({
        data: {
          idPeFisica_PFK: id,
          nome: perfil.nome,
          cpf: perfil.cpf,
        },
      });
    } else if (perfil instanceof PessoaJuridica) {
      await tx.pessoasjuridicas.create({
        data: {
          idPeJuridica_PFK: id,
          razaoSocial: perfil.razaoSocial,
          cnpj: perfil.cnpj,
          inscEstadual: perfil.inscrEstadual || null,
        },
      });
    }
    return id;
  }

  public async atualizarNomePessoaFisica(id: number, nome: string, idAdministrador: number, tx?: Prisma.TransactionClient): Promise<PessoaBase | null> {
    const db = tx ?? this.prisma;
    const atualizacao = await db.pessoasfisicas.updateMany({
      where: {
        idPeFisica_PFK: id,
        pessoas: { idAdministrador_FK: idAdministrador },
      },
      data: { nome: nome },
    });

    if (atualizacao.count === 0) return null;
    return await this.buscarPorId(id, db);
  }

  public async atualizarRazaoSocial(id: number, razaoSocial: string, idAdministrador: number, tx?: Prisma.TransactionClient): Promise<PessoaBase | null> {
    const db = tx ?? this.prisma;
    const atualizacao = await db.pessoasjuridicas.updateMany({
      where: {
        idPeJuridica_PFK: id,
        pessoas: { idAdministrador_FK: idAdministrador },
      },
      data: { razaoSocial: razaoSocial },
    });

    if (atualizacao.count === 0) return null;
    return await this.buscarPorId(id, db);
  }

  public async atualizarInscricaoEstadual(id: number, inscrEstadual: string, idAdministrador: number, tx?: Prisma.TransactionClient): Promise<PessoaBase | null> {
    const db = tx ?? this.prisma;
    const atualizacao = await db.pessoasjuridicas.updateMany({
      where: {
        idPeJuridica_PFK: id,
        pessoas: { idAdministrador_FK: idAdministrador },
      },
      data: { inscEstadual: inscrEstadual },
    });

    if (atualizacao.count === 0) throw new Error("Pessoa jurídica não encontrada para o ID informado.");
    return await this.buscarPorId(id, db);
  }

  public async atualizarInscricaoEstadualPorPessoaId(pessoaId: number, inscrEstadual: string, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
    const db = tx ?? this.prisma;
    const pessoa = await this.buscarPessoaPorId(pessoaId, db);

    if (!pessoa || pessoa.cnpj === null) {
      throw new Error("Pessoa jurídica não encontrada para o ID informado.");
    }
    if (pessoa.inscrEstadual === inscrEstadual) {
      throw new Error("INSCRICAO_EM_USO");
    }

    await db.pessoasjuridicas.update({
      where: { idPeJuridica_PFK: pessoaId },
      data: { inscEstadual: inscrEstadual },
    });

    return await this.buscarPessoaPorId(pessoaId, db);
  }

  public async atualizarCpfPessoa(pessoaId: number, novoCpf: string, tx?: Prisma.TransactionClient): Promise<PessoaBase | null> {
    const db = tx ?? this.prisma;

    await db.pessoasfisicas.update({
      where: { idPeFisica_PFK: pessoaId },
      data: { cpf: novoCpf },
    });

    return await this.buscarPorId(pessoaId, db);
  }

  public async atualizarCnpj(novoCnpj: string, pessoaId: number, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prisma;
    await db.pessoasjuridicas.update({
      where: { idPeJuridica_PFK: pessoaId },
      data: { cnpj: novoCnpj },
    });
  }

public async excluirPessoa(pessoa: PessoaBase, tx: Prisma.TransactionClient): Promise<void> {
    if (!pessoa.id) {
      throw new Error("ID_INVALIDO");
    }

    const enderecoId = await this.resolverIdEnderecoDaPessoa(pessoa.id, tx);

    await tx.pessoas.delete({
      where: { idPessoa_PK: pessoa.id },
    });

    if (enderecoId) {
      const [outrasPessoas, armazensCount, propriedadesCount] = await Promise.all([
        tx.pessoas.count({ where: { idEndereco_FK: enderecoId } }),
        tx.armazens.count({ where: { idEndereco_FK: enderecoId } }),
        tx.propriedades.count({ where: { idEndereco_FK: enderecoId } }),
      ]);

      if (outrasPessoas === 0 && armazensCount === 0 && propriedadesCount === 0) {
        await tx.enderecos.delete({ where: { idEndereco_PK: enderecoId } });
      }
    }
  }

  private async resolverIdEnderecoDaPessoa(pessoaId: number, tx?: Prisma.TransactionClient): Promise<number | null> {
    const db = tx ?? this.prisma;
    const pessoa = await db.pessoas.findUnique({
      where: { idPessoa_PK: pessoaId },
      select: { idEndereco_FK: true },
    });
    return pessoa?.idEndereco_FK ?? null;
  }

  public async cadastrarEndereco(enderecoData: Endereco, pessoaId: number, tx?: Prisma.TransactionClient): Promise<Endereco> {
    const executarOperacao = async (txClient: Prisma.TransactionClient) => {
      const enderecoExistenteId = await this.resolverIdEnderecoDaPessoa(pessoaId, txClient);

      let idEnderecoFinal: number;

      if (enderecoExistenteId) {
        const enderecoAtualizado = await txClient.enderecos.update({
          where: { idEndereco_PK: enderecoExistenteId },
          data: {
            cidade: enderecoData.cidade,
            bairro: enderecoData.bairro,
            cep: enderecoData.cep,
            uf: enderecoData.uf,
            pais: enderecoData.pais,
            logradouro: enderecoData.logradouro,
          },
        });
        idEnderecoFinal = enderecoAtualizado.idEndereco_PK;
      } else {
        const enderecoCriado = await txClient.enderecos.create({
          data: {
            cidade: enderecoData.cidade,
            bairro: enderecoData.bairro,
            cep: enderecoData.cep,
            uf: enderecoData.uf,
            pais: enderecoData.pais,
            logradouro: enderecoData.logradouro,
          },
        });
        idEnderecoFinal = enderecoCriado.idEndereco_PK;

        await txClient.pessoas.update({
          where: { idPessoa_PK: pessoaId },
          data: { idEndereco_FK: idEnderecoFinal },
        });
      }

      return new Endereco(
        enderecoData.cidade,
        enderecoData.bairro,
        enderecoData.cep,
        enderecoData.uf,
        enderecoData.pais,
        enderecoData.logradouro,
        idEnderecoFinal
      );
    };
    return tx ? await executarOperacao(tx) : await this.prisma.$transaction(executarOperacao);
  }

  public async atualizarEndereco(enderecoData: Endereco, pessoaId: number, tx?: Prisma.TransactionClient): Promise<Endereco> {
    return await this.cadastrarEndereco(enderecoData, pessoaId, tx);
  }

  public async removerEndereco(pessoaId: number, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
    const db = tx ?? this.prisma;
    const enderecoId = await this.resolverIdEnderecoDaPessoa(pessoaId, db);

    if (!enderecoId) return this.buscarPessoaPorId(pessoaId, db);

    await db.pessoas.update({
      where: { idPessoa_PK: pessoaId },
      data: { idEndereco_FK: null },
    });

    const [outrasPessoas, armazensCount, propriedadesCount] = await Promise.all([
      db.pessoas.count({ where: { idEndereco_FK: enderecoId } }),
      db.armazens.count({ where: { idEndereco_FK: enderecoId } }),
      db.propriedades.count({ where: { idEndereco_FK: enderecoId } }),
    ]);

    if (outrasPessoas === 0 && armazensCount === 0 && propriedadesCount === 0) {
      await db.enderecos.delete({ where: { idEndereco_PK: enderecoId } });
    }

    return this.buscarPessoaPorId(pessoaId, db);
  }

  public async buscarPorId(id: number, tx: Prisma.TransactionClient = this.prisma): Promise<PessoaBase | null> {
    const pessoaDB = await tx.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: searchPessoas,
    });

    if (!pessoaDB) return null;
    return this.mapToEntityComPapeis(pessoaDB);
  }

  private temRelacaoAtiva(relacao: unknown): boolean {
    if (!relacao) return false;
    return Array.isArray(relacao) ? relacao.length > 0 : true;
  }

  private obterPapel(p: PessoaSearchPayload): TipoPapel | null {
    if (this.temRelacaoAtiva(p.funcionarios)) return "funcionario";
    if (this.temRelacaoAtiva(p.clientes)) return "cliente";
    if (this.temRelacaoAtiva(p.meeiros)) return "meeiro";
    if (this.temRelacaoAtiva(p.fornecedores)) return "fornecedor";
    if (this.temRelacaoAtiva(p.prestadoresdeservico)) return "prestadordeservico";
    if (this.temRelacaoAtiva(p.diaristas)) return "diarista";
    return null;
  }

  public async listarPessoas(
    idAdministrador: number,
    pagina: number = 1,
    limite: number = 10
  ): Promise<ResultadoPaginacao<PessoaBase>> {
    const pessoasDB = await this.prisma.pessoas.findMany({
      where: { idAdministrador_FK: idAdministrador },
      include: searchPessoas,
    });

    const pessoas: PessoaBase[] = [];
    for (const p of pessoasDB) {
      const pessoaMapeada = this.mapToEntityComPapeis(p);
      if (pessoaMapeada) pessoas.push(pessoaMapeada);
    }

    pessoas.sort((a, b) => String(a.papel).localeCompare(String(b.papel)));

    const total = pessoas.length;
    const startIndex = (pagina - 1) * limite;
    const endIndex = startIndex + limite;

    return {
      data: pessoas.slice(startIndex, endIndex),
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  private mapToEntityComPapeis(p: PessoaSearchPayload): PessoaBase | null {
    if (!p) return null;

    const e = p.enderecos;
    const endereco = e
      ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
      : null;
    const isPF = !!p.pessoasfisicas;
    const papel = this.obterPapel(p);

    const dados: PessoaDTO = {
      id: p.idPessoa_PK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      papel: papel,
      nome: isPF ? p.pessoasfisicas!.nome : undefined,
      cpf: isPF ? p.pessoasfisicas!.cpf : null,
      razaoSocial: !isPF ? p.pessoasjuridicas!.razaoSocial : undefined,
      cnpj: !isPF ? (p.pessoasjuridicas!.cnpj ?? null) : null,
      inscrEstadual: !isPF ? (p.pessoasjuridicas!.inscEstadual ?? null) : null,
    };

    return PessoaFactory.criarPessoa(isPF ? "fisica" : "juridica", dados);
  }
}

export default PessoaRepository;