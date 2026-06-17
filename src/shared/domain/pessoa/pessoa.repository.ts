import { Prisma, PrismaClient } from "@prisma/client";
import PessoaBase from "./pessoabase.entity";
import PessoaFisica from "./pessoafisica.entity";
import PessoaJuridica from "./pessoajuridica.entity";
import Endereco from "../endereco/endereco.vo";

class PessoaRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
}


export default PessoaRepository;
