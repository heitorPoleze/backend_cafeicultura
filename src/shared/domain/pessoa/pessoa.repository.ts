import PessoaFisica from "./pessoafisica.entity";
import PessoaJuridica from "./pessoajuridica.entity";
import Endereco from "../endereco/endereco.vo";
import PessoaFactory from "./pessoafactory.entity";
import PessoaBase from "./pessoabase.entity";
import PessoaDTO from "./pessoa.dto";
import { Prisma, PrismaClient } from "@prisma/client";
import { ResultadoPaginacao } from "../../utils/pagination.dto";
const pessoaInclude = {
  pessoasfisicas: true,
  pessoasjuridicas: true,
  enderecos: true
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
} satisfies Prisma.pessoasInclude;

type PessoaSearchPayload = Prisma.pessoasGetPayload<{
  include: typeof searchPessoas;
}>;
class PessoaRepository {
  constructor(private readonly prisma: PrismaClient) { }
  //retornar pessoa construida
  public async salvar(
    perfil: PessoaFisica | PessoaJuridica,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    // 1. Salva a tabela base (pessoas)
    const pessoa = await tx.pessoas.create({
      data: { dataCadastro: perfil.dataCadastro, idAdministrador_FK: perfil.idAdministrador ? perfil.idAdministrador : null },
    });
    const id = pessoa.idPessoa_PK;

    // 2. Salva a tabela específica usando polimorfismo
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
    };
    return id
  };
  private async resolverIdEnderecoDaPessoa(pessoaId: number): Promise<number | null> {
    const pessoa = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: pessoaId },
      select: { idEndereco_FK: true },
    });

    if (pessoa?.idEndereco_FK) {
      return pessoa.idEndereco_FK;
    }

    const enderecoExistente = await this.prisma.enderecos.findUnique({
      where: { idEndereco_PK: pessoaId },
    });

    return enderecoExistente ? pessoaId : null;
  }

  //retorna endereco 
  public async cadastrarEndereco(enderecoData: Endereco, pessoaId: number): Promise<Endereco> {
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const enderecoExistenteId = await this.resolverIdEnderecoDaPessoaEmTransacao(tx, pessoaId);

      if (enderecoExistenteId) {
        const enderecoAtualizado = await tx.enderecos.update({
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

        await tx.pessoas.update({
          where: { idPessoa_PK: pessoaId },
          data: { idEndereco_FK: enderecoAtualizado.idEndereco_PK },
        });

        return new Endereco(
          enderecoAtualizado.cidade,
          enderecoAtualizado.bairro,
          enderecoAtualizado.cep,
          enderecoAtualizado.uf,
          enderecoAtualizado.pais,
          enderecoAtualizado.logradouro,
          enderecoAtualizado.idEndereco_PK,
        );
      }

      const enderecoCriado = await tx.enderecos.create({
        data: {
          cidade: enderecoData.cidade,
          bairro: enderecoData.bairro,
          cep: enderecoData.cep,
          uf: enderecoData.uf,
          pais: enderecoData.pais,
          logradouro: enderecoData.logradouro,
        },
      });

      await tx.pessoas.update({
        where: { idPessoa_PK: pessoaId },
        data: { idEndereco_FK: enderecoCriado.idEndereco_PK },
      });

      return new Endereco(
        enderecoCriado.cidade,
        enderecoCriado.bairro,
        enderecoCriado.cep,
        enderecoCriado.uf,
        enderecoCriado.pais,
        enderecoCriado.logradouro,
        enderecoCriado.idEndereco_PK,
      );
    });
  }
  public async verificarInscricaoEstadualExistente(ie: string,idProprietario: number): Promise<boolean> {
    const existe = await this.prisma.pessoasjuridicas.findUnique({
      where: { 
        inscEstadual: ie,
        pessoas: {
          idAdministrador_FK: idProprietario
        }
       },
    });
    return !!existe;
  }
  private async resolverIdEnderecoDaPessoaEmTransacao(
    tx: Prisma.TransactionClient,
    pessoaId: number,
  ): Promise<number | null> {
    const pessoa = await tx.pessoas.findUnique({
      where: { idPessoa_PK: pessoaId },
      select: { idEndereco_FK: true },
    });

    return pessoa?.idEndereco_FK ?? null;
  }

  public async atualizarEndereco(enderecoData: Endereco, pessoaId: number): Promise<Endereco> {
    const enderecoId = await this.resolverIdEnderecoDaPessoa(pessoaId);

    if (!enderecoId) {
      return await this.cadastrarEndereco(enderecoData, pessoaId);
    }

    const enderecoAtualizado = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const endereco = await tx.enderecos.update({
        where: { idEndereco_PK: enderecoId },
        data: {
          cidade: enderecoData.cidade,
          bairro: enderecoData.bairro,
          cep: enderecoData.cep,
          uf: enderecoData.uf,
          pais: enderecoData.pais,
          logradouro: enderecoData.logradouro,
        },
      });

      await tx.pessoas.update({
        where: { idPessoa_PK: pessoaId },
        data: { idEndereco_FK: endereco.idEndereco_PK },
      });

      return endereco;
    });

    return new Endereco(
      enderecoAtualizado.cidade,
      enderecoAtualizado.bairro,
      enderecoAtualizado.cep,
      enderecoAtualizado.uf,
      enderecoAtualizado.pais,
      enderecoAtualizado.logradouro,
      enderecoAtualizado.idEndereco_PK,
    );
  };

  //retorna pessoa sem endereco
  public async removerEndereco(pessoaId: number, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
    const pessoa = await (tx ?? this.prisma).pessoas.findUnique({
      where: { idPessoa_PK: pessoaId },
      select: { idEndereco_FK: true },
    });

    if (!pessoa?.idEndereco_FK) {
      return this.buscarPessoaPorId(pessoaId);
    }

    const enderecoId = pessoa.idEndereco_FK;

    await (tx ?? this.prisma).pessoas.update({
      where: { idPessoa_PK: pessoaId },
      data: { idEndereco_FK: null },
    });

    const [outrasPessoas, armazensCount, propriedadesCount] = await Promise.all([
      (tx ?? this.prisma).pessoas.count({ where: { idEndereco_FK: enderecoId } }),
      (tx ?? this.prisma).armazens.count({ where: { idEndereco_FK: enderecoId } }),
      (tx ?? this.prisma).propriedades.count({ where: { idEndereco_FK: enderecoId } }),
    ]);

    if (outrasPessoas === 0 && armazensCount === 0 && propriedadesCount === 0) {
      await (tx ?? this.prisma).enderecos.delete({ where: { idEndereco_PK: enderecoId } });
    }

    return this.buscarPessoaPorId(pessoaId);
  }

  public async verificarCpfExistente(cpf: string): Promise<boolean> {
    const existe = await this.prisma.pessoasfisicas.findUnique({
      where: { cpf },
    });
    return !!existe;
  };

  private normalizarCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, "");
  }

  private async buscarPessoaJuridicaPorCnpj(cnpj: string) {
    const cnpjNormalizado = this.normalizarCnpj(cnpj);
    const pessoasJuridicas = await this.prisma.pessoasjuridicas.findMany({
      select: {
        idPeJuridica_PFK: true,
        cnpj: true,
        razaoSocial: true,
        inscEstadual: true,
      },
    });

    return pessoasJuridicas.find((pessoa: any) => this.normalizarCnpj(pessoa.cnpj) === cnpjNormalizado) ?? null;
  }

  public async verificarCnpjExistente(cnpj: string): Promise<boolean> {
    const existe = await this.buscarPessoaJuridicaPorCnpj(cnpj);
    return !!existe;
  };

  public async buscarPorId(id: number, tx?: Prisma.TransactionClient): Promise<PessoaBase | null> {
    const pessoaDB = await (tx ?? this.prisma).pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: pessoaInclude
    });

    if (!pessoaDB) return null;
    return this.mapToEntity(pessoaDB);
  };
private obterPapel(p: PessoaSearchPayload): string | null {
  if (p.funcionarios) return 'funcionario';
  if (p.clientes) return 'cliente';
  if (p.meeiros) return 'meeiro';
  if (p.fornecedores) return 'fornecedor';
  if (p.prestadoresdeservico) return 'prestadordeservico';
  return null;
}
public async listarPessoas(
  idAdministrador: number,
  pagina: number = 1,
  limite: number = 10,
): Promise<ResultadoPaginacao<PessoaBase>> {
  const where = { idAdministrador_FK: idAdministrador };
  const pessoasDB = await this.prisma.pessoas.findMany({
    where,
    include: searchPessoas,
  });

  const pessoas: PessoaBase[] = [];
  for (const p of pessoasDB) {
    const pessoaMapeada = this.mapToEntityComPapeis(p);
    if (pessoaMapeada) {
      pessoas.push(pessoaMapeada);
    }
  }

  pessoas.sort((a, b) => {
    const papelA = String(a.papel || "");
    const papelB = String(b.papel || "");
    return papelA.localeCompare(papelB);
  });

  const total = pessoas.length;
  const startIndex = (pagina - 1) * limite;
  const endIndex = startIndex + limite;
  
  const pessoasPaginadas = pessoas.slice(startIndex, endIndex);

  return {
    data: pessoasPaginadas,
    total,
    pagina,
    totalPaginas: Math.ceil(total / limite),
  };
}
 private mapToEntityComPapeis(p: PessoaSearchPayload): PessoaBase | null {
      if (!p) return null;

      const e = p.enderecos;
      const endereco = e
        ? new Endereco(e.logradouro, e.bairro, e.cidade, e.uf, e.pais, e.cep, e.idEndereco_PK)
        : null;

      const tipoPessoa = p.pessoasfisicas ? 'fisica' : 'juridica';
      const papel = this.obterPapel(p);

      const dados = {
        id: p.idPessoa_PK,
        idAdministrador: p.idAdministrador_FK,
        dataCadastro: p.dataCadastro,
        endereco: endereco,
        papel,
        nome: p.pessoasfisicas?.nome,
        cpf: p.pessoasfisicas?.cpf,
        razaoSocial: p.pessoasjuridicas?.razaoSocial,
        cnpj: p.pessoasjuridicas?.cnpj,
        inscEstadual: p.pessoasjuridicas?.inscEstadual,
      };

      return PessoaFactory.criarPessoa(tipoPessoa, dados);
  }

  private mapToEntity(p: PessoaPayload): PessoaBase | null {
    if (!p) return null;

    const e = p.enderecos;

    const endereco = e
      ? new Endereco(e.logradouro, e.bairro, e.cidade, e.uf, e.pais, e.cep, e.idEndereco_PK)
      : null;

    const tipoPessoa = p.pessoasfisicas ? 'fisica' : 'juridica';

    const dados = {
      id: p.idPessoa_PK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf,
      razaoSocial: p.pessoasjuridicas?.razaoSocial,
      cnpj: p.pessoasjuridicas?.cnpj,
      inscEstadual: p.pessoasjuridicas?.inscEstadual
    };

    return PessoaFactory.criarPessoa(tipoPessoa, dados);
  }
 
  //retornam pessoa atualizada depois da alteração 
  public async atualizarNomePessoaFisica(cpf: string, nome?: string): Promise<PessoaDTO | null> {
    await this.prisma.pessoasfisicas.update({
      where: { cpf: cpf },
      data: {
        nome: nome
      }
    });
    let resultado = await this.buscarPessoaPorCpf(cpf)
    return resultado
  }
  public async atualizarInscricaoEstadual(cnpj: string, inscrEstadual: string): Promise<PessoaDTO | null> {
    const pessoaJuridica = await this.buscarPessoaJuridicaPorCnpj(cnpj);

    if (!pessoaJuridica) {
      throw new Error("Pessoa jurídica não encontrada para o CNPJ informado.");
    }

    await this.prisma.pessoasjuridicas.update({
      where: { idPeJuridica_PFK: pessoaJuridica.idPeJuridica_PFK },
      data: {
        inscEstadual: inscrEstadual,
      },
    });

    return await this.buscarPessoaPorCnpj(cnpj);
  }

  public async atualizarInscricaoEstadualPorPessoaId(pessoaId: number, inscrEstadual: string): Promise<PessoaDTO | null> {
    const pessoaBase = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: pessoaId },
      include: { pessoasjuridicas: true },
    });

    if (!pessoaBase?.pessoasjuridicas) {
      throw new Error("Pessoa jurídica não encontrada para o ID informado.");
    }
    if(pessoaBase?.pessoasjuridicas.inscEstadual === inscrEstadual){
      throw new Error("INSCRICAO_EM_USO");
      }

    await this.prisma.pessoasjuridicas.update({
      where: { idPeJuridica_PFK: pessoaBase.pessoasjuridicas.idPeJuridica_PFK },
      data: {
        inscEstadual: inscrEstadual,
      },
    });

    return await this.buscarPessoaPorId(pessoaId);
  }
  public async atualizarRazaoSocial(cnpj: string, razaoSocial: string,): Promise<PessoaDTO | null> {
    await this.prisma.pessoasjuridicas.update({
      where: { cnpj: cnpj },
      data: {
        razaoSocial: razaoSocial,
      }
    })
    let resultado = await this.buscarPessoaPorCnpj(cnpj)
    return resultado
  }
  public async atualizarCnpj(novoCnpj:string,pessoaId:number){
    await this.prisma.pessoasjuridicas.update({
      where: {idPeJuridica_PFK:pessoaId},
      data:{
        cnpj: novoCnpj
      }
    })
  }
  
  //buscadores de pessoa
  public async buscarPessoaPorCnpj(cnpj: string): Promise<PessoaDTO | null> {
    const pessoa = await this.buscarPessoaJuridicaPorCnpj(cnpj);
    if (!pessoa) return null;

    const pessoaBase = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: pessoa.idPeJuridica_PFK }
    });

    const endereco = await this.prisma.enderecos.findUnique({
      where: { idEndereco_PK: pessoaBase?.idEndereco_FK || 0 }, // Usando FK da tabela base
    });

    return this.mapToPessoaDTO(pessoa, pessoaBase, endereco, 'PJ');
  }

  public async buscarPessoaPorCpf(cpf: string): Promise<PessoaDTO | null> {
    const pessoa = await this.prisma.pessoasfisicas.findUnique({ where: { cpf } });
    if (!pessoa) return null;

    const pessoaBase = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: pessoa.idPeFisica_PFK }
    });

    const endereco = await this.prisma.enderecos.findUnique({
      where: { idEndereco_PK: pessoaBase?.idEndereco_FK || 0 },
    });

    return this.mapToPessoaDTO(pessoa, pessoaBase, endereco, 'PF');
  }
  public async atualizarCpfPessoa(cpf: string, pessoaId: number): Promise<PessoaDTO | null> {
    const pessoaBase = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: pessoaId },
      include: { pessoasfisicas: true, pessoasjuridicas: true }
    });
    if (!pessoaBase) return null;
    if (pessoaBase.pessoasfisicas) {
      await this.prisma.pessoasfisicas.update({
        where: { idPeFisica_PFK: pessoaId },
        data: {
          cpf: cpf,
        }
      });

      const pessoa = await this.prisma.pessoasfisicas.findUnique({ where: { idPeFisica_PFK: pessoaId } });
      if (!pessoa) return null;
      const endereco = await this.prisma.enderecos.findUnique({
        where: { idEndereco_PK: pessoaBase?.idEndereco_FK || 0 },
      });
      return this.mapToPessoaDTO(pessoa, pessoaBase, endereco, 'PF');


    } else {
      throw new Error("Esta pessoa não é uma pessoa física.");
    }

  }
  public async buscarPessoaPorId(pessoaId: number, tx?: Prisma.TransactionClient): Promise<PessoaDTO | null> {
     if(!pessoaId || pessoaId <= 0 || !Number.isInteger(pessoaId)) {
      throw new Error("ID_INVALIDO");
    }
    const pessoaBase = await (tx ?? this.prisma).pessoas.findUnique({
      where: { idPessoa_PK: pessoaId },
      include: { pessoasfisicas: true, pessoasjuridicas: true }
    });

    if (!pessoaBase) return null;

    const endereco = await (tx ?? this.prisma).enderecos.findUnique({
      where: { idEndereco_PK: pessoaBase.idEndereco_FK || 0 },
    });

    if (pessoaBase.pessoasfisicas) {
      return this.mapToPessoaDTO(pessoaBase.pessoasfisicas, pessoaBase, endereco, 'PF');
    }

    if (pessoaBase.pessoasjuridicas) {
      return this.mapToPessoaDTO(pessoaBase.pessoasjuridicas, pessoaBase, endereco, 'PJ');
    }

    return null;
  }

  public async excluirPessoa(pessoa: PessoaBase, tx: Prisma.TransactionClient): Promise<void> {
    await tx.pessoas.delete({
      where: { idPessoa_PK: pessoa.id }
    });
  };

  private mapToPessoaDTO(pessoa: any, pessoaBase: any, endereco: any | null, tipo: 'PF' | 'PJ'): PessoaDTO {
    return {
      id: tipo === 'PF' ? pessoa.idPeFisica_PFK : pessoa.idPeJuridica_PFK,
      nome: tipo === 'PF' ? pessoa.nome : pessoa.nomeFantasia,
      cpf: tipo === 'PF' ? pessoa.cpf : undefined,
      razaoSocial: tipo === 'PJ' ? pessoa.razaoSocial : undefined,
      cnpj: tipo === 'PJ' ? pessoa.cnpj : undefined,
      inscrEstadual: tipo === 'PJ' ? pessoa.inscrEstadual : null,
      endereco: endereco,
      dataCadastro: pessoaBase.dataCadastro,
    };
  }
}



export default PessoaRepository;
