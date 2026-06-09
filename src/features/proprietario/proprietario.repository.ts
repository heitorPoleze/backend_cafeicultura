import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";
import Pessoa from "../../shared/domain/pessoa/pessoa.entity";
import Proprietario from "./proprietario.entity";


import Credencial from "../auth/auth.entity";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import { PrismaClient, Prisma } from "@prisma/client";

class ProprietarioRepository {
  constructor(private prisma: PrismaClient) {}

  public async salvarComTransacao(prop: Proprietario, cred: Credencial): Promise<number> {
    return await this.prisma.$transaction(async () => {
      // 1. Cria a Pessoa base (model: pessoas)
      const pessoa = await this.prisma.pessoas.create({
        data: { dataCadastro: prop.perfil.dataCadastro }
      });
      const id = pessoa.idPessoa_PK;

      // 2. Cria a especialização (PF ou PJ)
      if (prop.tipoUser === "PF") {
        const pf = prop.perfil as PessoaFisica;
        await this.prisma.pessoasfisicas.create({
          data: { idPeFisica_PFK: id, nome: pf.nomeExibicao, cpf: pf.cpf }
        });
      } else {
        const pj = prop.perfil as PessoaJuridica;
        await this.prisma.pessoasjuridicas.create({
          data: { idPeJuridica_PFK: id, razaoSocial: pj.razaoSocial, cnpj: pj.cnpj, inscEstadual: pj.inscricaoEstadual || null }
        });
      }

      // 3. Vincula como Proprietário
      await this.prisma.proprietarios.create({ data: { idProprietario_PFK: id } });

      // 4. Cria as Credenciais de Usuário
      await this.prisma.usuarios.create({
        data: {
          idUsuario_PFK: id,
          email: cred.email,
          telefone: cred.telefone,
          senha: cred.senha || ""
        }
      });

      return id;
    });
  }

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

  public async buscarPorId(id: number): Promise<Proprietario | null> {
    const prop = await this.prisma.proprietarios.findUnique({
      where: { idProprietario_PFK: id }
    });

    if (!prop) return null;

    const p = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: {
        pessoasfisicas: true,
        pessoasjuridicas: true,
        enderecos: true,
        usuarios: true
      }
    });

    if (!p || !p.usuarios) return null;

    const u = p.usuarios;
    const e = p.enderecos;
    
    const endereco = e 
      ? new Endereco(e.logradouro, e.bairro, e.cidade, e.uf, e.pais, e.cep, e.idEndereco_PK)
      : undefined;

    let perfil: Pessoa;
    if (p.pessoasfisicas) {
      const pf = p.pessoasfisicas;
      perfil = new PessoaFisica(pf.nome, pf.cpf, p.dataCadastro, u.idUsuario_PFK, endereco);
    } else {
      const pj = p.pessoasjuridicas!;
      perfil = new PessoaJuridica(pj.razaoSocial, pj.cnpj, pj.inscEstadual, p.dataCadastro, u.idUsuario_PFK, endereco);
    }

    return new Proprietario(perfil, u.email, u.telefone, u.senha);
  }

  public async removerEndereco(pessoaId: number): Promise<void> {
    await this.prisma.enderecos.delete({ where: { idEndereco_PK: pessoaId } });
  }

  public async excluir(id: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.proprietarios.delete({ where: { idProprietario_PFK: id } }),
      this.prisma.usuarios.delete({ where: { idUsuario_PFK: id } }),
      this.prisma.enderecos.deleteMany({ where: { idEndereco_PK: id } }),
      this.prisma.pessoasfisicas.deleteMany({ where: { idPeFisica_PFK: id } }),
      this.prisma.pessoasjuridicas.deleteMany({ where: { idPeJuridica_PFK: id } }),
      this.prisma.pessoas.delete({ where: { idPessoa_PK: id } })
    ]);
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
  }

  public async atualizarProprietario(proprietario: Proprietario): Promise<void> {
    const id = proprietario.idPessoa;
    if (!id) throw new Error("ID do proprietário não encontrado para atualização.");

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.usuarios.update({
        where: { idUsuario_PFK: id },
        data: {
          email: proprietario.email,
          telefone: proprietario.telefone,
          senha: proprietario.credencial.senha
        }
      });

      if (proprietario.tipoUser === "PF") {
        const pf = proprietario.perfil as PessoaFisica;
        await tx.pessoasfisicas.update({
          where: { idPeFisica_PFK: id },
          data: { nome: pf.nomeExibicao, cpf: pf.cpf }
        });
      } else {
        const pj = proprietario.perfil as PessoaJuridica;
        await tx.pessoasjuridicas.update({
          where: { idPeJuridica_PFK: id },
          data: { razaoSocial: pj.razaoSocial, cnpj: pj.cnpj, inscEstadual: pj.inscricaoEstadual || null }
        });
      }
    });
  }

  public async verificarCPFExistente(cpf: string): Promise<boolean> {
    const existe = await this.prisma.pessoasfisicas.findUnique({
      where: { cpf }
    });
    return !!existe;
  }

  public async verificarCNPJExistente(cnpj: string): Promise<boolean> {
    const existe = await this.prisma.pessoasjuridicas.findUnique({
      where: { cnpj }
    });
    return !!existe;
  }
}

export default ProprietarioRepository;