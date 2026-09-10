import PessoaFactory from "../../shared/domain/pessoa/pessoafactory.entity";
import Proprietario from "./proprietario.entity";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import UsuarioRepository from "../usuario/usuario.repository";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import { Prisma, PrismaClient } from "@prisma/client"; // Fixed import path

class ProprietarioRepository {
  constructor(
    private prisma: PrismaClient,
    private pessoaRepo: PessoaRepository,
    private usuarioRepo: UsuarioRepository
  ) {};

  public async salvarComTransacao(prop: Proprietario, tx?: Prisma.TransactionClient): Promise<number> {
    const execute = async (db: Prisma.TransactionClient) => {
      const id = await this.pessoaRepo.salvar(prop.perfil, db);
      await this.usuarioRepo.salvar(prop, id, db);
      await db.proprietarios.create({
        data: { idProprietario_PFK: id }
      });
      return id;
    };

    return tx ? await execute(tx) : await this.prisma.$transaction(execute);
  }

  public async buscarPorId(id: number, tx?: Prisma.TransactionClient): Promise<Proprietario | null> {
    const db = tx ?? this.prisma;

    const prop = await db.proprietarios.findUnique({
      where: { idProprietario_PFK: id }
    });

    if (!prop) return null;

    const p = await db.pessoas.findUnique({
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
      ?  new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK) 
      : null;

    const tipoPessoa = p.pessoasfisicas ? 'fisica' : 'juridica';

    const dados = {
      id: u.idUsuario_PFK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf,
      razaoSocial: p.pessoasjuridicas?.razaoSocial,
      cnpj: p.pessoasjuridicas?.cnpj,
      inscrEstadual: p.pessoasjuridicas?.inscEstadual ?? null,
    };

    const perfil = PessoaFactory.criarPessoa(tipoPessoa, dados as any);

    return new Proprietario(perfil, u.email, u.telefone, u.senha);
  }

  public async updateSenhaProprietario(novaSenha: string, id: number, tx?: Prisma.TransactionClient) {
    await this.usuarioRepo.updateSenhaUser(novaSenha, id, tx);
  }

  public async updateEmailProprietario(email: string, id: number, tx?: Prisma.TransactionClient) {
    await this.usuarioRepo.updateEmail(email, id, tx);
  }

  public async updateTelefoneProprietario(telefone: string, id: number, tx?: Prisma.TransactionClient) {
    await this.usuarioRepo.updateTelefone(telefone, id, tx);
  }

  public async updateNome(novoNome: string, id: number, tx?: Prisma.TransactionClient) {
    await this.usuarioRepo.updateNomeUser(novoNome, id, tx);
  }

  public async updateRazaoSocial(novaRazao: string, id: number, tx?: Prisma.TransactionClient) {
    await this.usuarioRepo.updateRazaoSocialUser(novaRazao, id, tx);
  }

  public async updateInscricaoEstadual(novaInscricao: string, id: number, tx?: Prisma.TransactionClient) {
    await this.usuarioRepo.updateInscricaoEstadualUser(novaInscricao, id, tx);
  }

  public async deletarProprietario(pessoaId: number, tx?: Prisma.TransactionClient): Promise<void> {
    const execute = async (db: Prisma.TransactionClient) => {
      const pessoa = await db.pessoas.findUnique({
        where: { idPessoa_PK: pessoaId },
        include: {
          pessoasfisicas: true,
          pessoasjuridicas: true,
          enderecos: true,
          usuarios: true
        }
      });
      if (!pessoa) return;

      await db.propriedades.deleteMany({
        where: { idProprietario_FK: pessoaId }
      });
      await db.proprietarios.delete({
        where: { idProprietario_PFK: pessoaId }
      });
      if (pessoa.pessoasfisicas) {
        await db.pessoasfisicas.delete({ where: { idPeFisica_PFK: pessoaId } });
      }
      if (pessoa.pessoasjuridicas) {
        await db.pessoasjuridicas.delete({ where: { idPeJuridica_PFK: pessoaId } });
      }
      if (pessoa.usuarios) {
        await db.usuarios.delete({ where: { idUsuario_PFK: pessoaId } });
      }
      if (pessoa.enderecos) {
        await db.pessoas.update({
          where: { idPessoa_PK: pessoaId },
          data: { idEndereco_FK: null }
        });
        await db.enderecos.delete({
          where: { idEndereco_PK: pessoa.enderecos.idEndereco_PK }
        });
      }
      await db.pessoas.delete({
        where: { idPessoa_PK: pessoaId }
      });
    };

    return tx ? await execute(tx) : await this.prisma.$transaction(execute);
  }
}

export default ProprietarioRepository;