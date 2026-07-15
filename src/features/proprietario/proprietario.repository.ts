import PessoaFactory from "../../shared/domain/pessoa/pessoafactory.entity";
import Proprietario from "./proprietario.entity";
import { PrismaClient, Prisma } from "@prisma/client";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import UsuarioRepository from "../usuario/usuario.repository";
import Endereco from "../../shared/domain/endereco/endereco.vo";

class ProprietarioRepository {
  constructor(
    private prisma: PrismaClient,
    private pessoaRepo: PessoaRepository,
    private usuarioRepo: UsuarioRepository
  ) {}

  public async salvarComTransacao(prop: Proprietario): Promise<number> {
    
    // Inicia a transação (Unit of Work)
    return await this.prisma.$transaction(async (tx) => {
      
      // 1. Delega a criação da Pessoa (Física/Jurídica) passando o 'tx'
      const id = await this.pessoaRepo.salvar(prop.perfil, tx);

      // 2. Delega a criação da Credencial de Usuário passando o 'tx'
      await this.usuarioRepo.salvar(prop, id, tx);
      
      // 3. O próprio repositório salva sua entidade principal
      await tx.proprietarios.create({ 
        data: { idProprietario_PFK: id } 
      });

      return id;
    });
  };

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
      : null;

    const tipoPessoa = p.pessoasfisicas ? 'fisica' : 'juridica';

    const dados = {
      id: u.idUsuario_PFK, 
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf,
      razaoSocial: p.pessoasjuridicas?.razaoSocial,
      cnpj: p.pessoasjuridicas?.cnpj,
      inscrEstadual: p.pessoasjuridicas?.inscEstadual ?? null,
    };

    // 4. Delega a criação para a Factory
    const perfil = PessoaFactory.criarPessoa(tipoPessoa, dados);

    return new Proprietario(perfil, u.email, u.telefone, u.senha);
  };
  //revisar
  public async updateSenhaProprietario(novaSenha: string, id: number){
    await this.usuarioRepo.updateSenhaUser(novaSenha, id);
  }
  public async updateEmailProprietario(email: string, id: number){
    await this.usuarioRepo.updateEmail(email, id);
  }
  public async updateTelefoneProprietario(telefone: string, id: number){
    await this.usuarioRepo.updateTelefone(telefone, id);
  }
  public async updateNome(novoNome:string,id:number){
    await this.usuarioRepo.updateNomeUser(novoNome,id)
  }
  public async updateRazaoSocial(novaRazao:string,id:number){
    await this.usuarioRepo.updateRazaoSocialUser(novaRazao,id)
  }
  public async updateInscricaoEstadual(novaInscricao:string, cnpj:string){
    await this.pessoaRepo.atualizarInscricaoEstadual(novaInscricao, cnpj)
  }
public async deletarProprietario(pessoaId: number): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    const pessoa = await tx.pessoas.findUnique({
      where: { idPessoa_PK: pessoaId },
      include: {
        pessoasfisicas: true,
        pessoasjuridicas: true,
        enderecos: true,
        usuarios: true
      }
    });

    if (!pessoa) return;
    await tx.propriedades.deleteMany({
      where: { idProprietario_FK: pessoaId }
    });
    await tx.proprietarios.delete({
      where: { idProprietario_PFK: pessoaId }
    });

    if (pessoa.pessoasfisicas) {
      await tx.pessoasfisicas.delete({ where: { idPeFisica_PFK: pessoaId } });
    }

    if (pessoa.pessoasjuridicas) {
      await tx.pessoasjuridicas.delete({ where: { idPeJuridica_PFK: pessoaId } });
    }

    if (pessoa.usuarios) {
      await tx.usuarios.delete({ where: { idUsuario_PFK: pessoaId } });
    }

    if (pessoa.enderecos) {
      await tx.pessoas.update({
        where: { idPessoa_PK: pessoaId },
        data: { idEndereco_FK: null }
      });

      await tx.enderecos.delete({
        where: { idEndereco_PK: pessoa.enderecos.idEndereco_PK }
      });
    }

    await tx.pessoas.delete({
      where: { idPessoa_PK: pessoaId }
    });
  });
}
}

export default ProprietarioRepository;