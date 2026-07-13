import { Prisma, PrismaClient } from "@prisma/client";
import PessoaBase from "./pessoabase.entity";
import PessoaFisica from "./pessoafisica.entity";
import PessoaJuridica from "./pessoajuridica.entity";
import Endereco from "../endereco/endereco.vo";
import PessoaDTO from "./pessoa.dto";

class PessoaRepository {
  constructor(private readonly prisma: PrismaClient) { }
  //retornar pessoa construida
  public async salvar(
    perfil: PessoaBase,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    // 1. Salva a tabela base (pessoas)
    const pessoa = await tx.pessoas.create({
      data: { dataCadastro: perfil.dataCadastro },
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
  //retorna endereco 
  public async cadastrarEndereco(enderecoData: Endereco, pessoaId: number): Promise<Endereco> {
    await this.prisma.enderecos.create({
      data: {
        idEndereco_PK: pessoaId,
        cidade: enderecoData.cidade,
        bairro: enderecoData.bairro,
        cep: enderecoData.cep,
        uf: enderecoData.uf,
        pais: enderecoData.pais,
        logradouro: enderecoData.logradouro
      }
    });
    return enderecoData;
  }

  public async atualizarEndereco(enderecoData: Endereco, pessoaId: number): Promise<Endereco> {
    await this.prisma.enderecos.update({
      where: { idEndereco_PK: pessoaId },
      data: {
        cidade: enderecoData.cidade,
        bairro: enderecoData.bairro,
        cep: enderecoData.cep,
        uf: enderecoData.uf,
        pais: enderecoData.pais,
        logradouro: enderecoData.logradouro
      }
    });
    return enderecoData;
  };
  //retorna pessoa sem endereco
  public async removerEndereco(pessoaId: number): Promise<PessoaDTO|null>{
    await this.prisma.enderecos.delete({
      where: { idEndereco_PK: pessoaId },
    });
    let resultado = await this.buscarPessoaPorId(pessoaId)
    return resultado
  }

  public async verificarCpfExistente(cpf: string): Promise<boolean> {
    const existe = await this.prisma.pessoasfisicas.findUnique({
      where: { cpf },
    });
    return !!existe;
  };

  public async verificarCnpjExistente(cnpj: string): Promise<boolean> {
    const existe = await this.prisma.pessoasjuridicas.findUnique({
      where: { cnpj },
    });
    return !!existe;
  };

  //retornam pessoa atualizada depois da alteração 
  public async atualizarNomePessoaFisica(cpf: string, nome?: string): Promise<PessoaDTO|null> {
    await this.prisma.pessoasfisicas.update({
      where: { cpf: cpf },
      data: {
        nome: nome
      }
    });
    let resultado = await this.buscarPessoaPorCpf(cpf)
    return resultado
  }
  public async atualizarInscricaoEstadual(cnpj: string, inscrEstadual: string): Promise<PessoaDTO|null> {
    await this.prisma.pessoasjuridicas.update({
      where: { cnpj: cnpj },
      data: {
        inscEstadual: inscrEstadual
      }
    })
    let resultado = await this.buscarPessoaPorCnpj(cnpj)
    return resultado
  }
  public async atualizarRazaoSocial(cnpj: string, razaoSocial: string,): Promise<PessoaDTO|null> {
    await this.prisma.pessoasjuridicas.update({
      where: { cnpj: cnpj },
      data: {
        razaoSocial: razaoSocial,
      }
    })
    let resultado = await this.buscarPessoaPorCnpj(cnpj)
    return resultado
  }
  //buscadores de pessoa
public async buscarPessoaPorCnpj(cnpj: string): Promise<PessoaDTO | null> {
  const pessoa = await this.prisma.pessoasjuridicas.findUnique({ where: { cnpj } });
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

public async buscarPessoaPorId(pessoaId: number): Promise<PessoaDTO | null> {
  const pessoaBase = await this.prisma.pessoas.findUnique({ 
    where: { idPessoa_PK: pessoaId },
    include: { pessoasfisicas: true, pessoasjuridicas: true } 
  });

  if (!pessoaBase) return null;

  const endereco = await this.prisma.enderecos.findUnique({
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
