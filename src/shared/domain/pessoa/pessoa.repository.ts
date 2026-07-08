import { Prisma, PrismaClient } from "@prisma/client";
import PessoaFisica from "./pessoafisica.entity";
import PessoaJuridica from "./pessoajuridica.entity";
import Endereco from "../endereco/endereco.vo";
import PessoaFactory from "./pessoafactory.entity";
import PessoaBase from "./pessoabase.entity";

const pessoaInclude = {
  pessoasfisicas: true,
  pessoasjuridicas: true,
  enderecos: true
} satisfies Prisma.pessoasInclude;

type PessoaPayload = Prisma.pessoasGetPayload<{
  include: typeof pessoaInclude;
}>;

class PessoaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async salvar(
    perfil: PessoaFisica | PessoaJuridica,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    // 1. Salva a tabela base (pessoas)
    const pessoa = await tx.pessoas.create({
      data: { dataCadastro: perfil.dataCadastro, idAdministrador: perfil.idAdministrador ? perfil.idAdministrador : null},
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
    return id;
  };

  public async cadastrarEndereco(enderecoData: Endereco, pessoaId: number): Promise<number> {
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
    return pessoaId;
  }

  public async atualizarEndereco(enderecoData: Endereco, pessoaId: number): Promise<void> {
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
  };

  public async removerEndereco(pessoaId: number): Promise<void> {
    await this.prisma.enderecos.delete({ where: { idEndereco_PK: pessoaId } });
  };

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

  public async buscarPorId(id: number): Promise<PessoaBase | null> {
    const pessoaDB = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: pessoaInclude
    });

    if (!pessoaDB) return null;
    return this.mapToEntity(pessoaDB);
  };

  public async listarPessoas(idAdministrador: number): Promise<PessoaBase[]> {
    const pessoasDB = await this.prisma.pessoas.findMany({
      where: { idAdministrador_FK: idAdministrador },
      include: pessoaInclude, 
    });

    console.log(pessoasDB);

    const pessoas: PessoaBase[] = [];

    for (const p of pessoasDB) {
      const pessoaMapeada = this.mapToEntity(p);
      if (pessoaMapeada) {
        pessoas.push(pessoaMapeada);
      };
    };
    return pessoas;
  };

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
}


export default PessoaRepository;
