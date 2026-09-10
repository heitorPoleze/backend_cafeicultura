import ProprietarioRepository from "./proprietario.repository";
import Proprietario from "./proprietario.entity";
import PessoaFactory from "../../shared/domain/pessoa/pessoafactory.entity";
import { CreateProprietarioDTO } from "./proprietario.dto";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import UsuarioRepository from "../usuario/usuario.repository";
import Usuario from "../usuario/usuario.entity";
import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";
import bcrypt from "bcryptjs";
import PessoaDTO from "../../shared/domain/pessoa/pessoa.dto";
import { Prisma, PrismaClient } from "@prisma/client";

export default class ProprietarioService {
  constructor(
    private prisma: PrismaClient,
    private repo: ProprietarioRepository,
    private pessoaRepo: PessoaRepository,
    private usuarioRepo: UsuarioRepository
  ) { };

  private async validarProprietario(pessoaId: number, idUsuario: number, tx: Prisma.TransactionClient): Promise<Proprietario> {
    const proprietario = await this.repo.buscarPorId(pessoaId, tx);
    if (!proprietario) {
      throw new Error("NAO_ENCONTRADO");
    }
    if (proprietario.perfil.id !== idUsuario) {
      throw new Error("ACESSO_NEGADO");
    }
    return proprietario;
  };

  public async cadastrar(dados: CreateProprietarioDTO): Promise<PessoaDTO> {
    return await this.prisma.$transaction(async (tx) => {
      const idAdminRoot = null;

      if (dados.tipoPessoa === "fisica") {
        const cpfExistente = await this.pessoaRepo.verificarCpfExistente(dados.cpf!, idAdminRoot, tx);
        if (cpfExistente) throw new Error(`CPF_EXISTENTE`);
      } else if (dados.tipoPessoa === "juridica") {
        const cnpjExistente = await this.pessoaRepo.verificarCnpjExistente(dados.cnpj!, idAdminRoot, tx);
        if (cnpjExistente) throw new Error(`CNPJ_EXISTENTE`);

        if (dados.inscrEstadual != null) {
          const inscricaoExistente = await this.usuarioRepo.verificarInscricaoEstadualExistente(dados.inscrEstadual, tx);
          if (inscricaoExistente) throw new Error(`INSCRICAO_EXISTENTE`);
        }
      }
      const emailExistente = await this.usuarioRepo.verificarEmailExistente(dados.email, tx);
      if (emailExistente) throw new Error(`EMAIL_EXISTENTE`);

      const telefoneExistente = await this.usuarioRepo.verificarTelefoneExistente(dados.telefone, tx);
      if (telefoneExistente) throw new Error(`TELEFONE_EXISTENTE`);

      const perfil = PessoaFactory.criarPessoa(dados.tipoPessoa, dados);
      const credencial = new Usuario(dados.email, dados.telefone, dados.senha, perfil);
      await credencial.criptografarSenha();

      const proprietario = new Proprietario(perfil, credencial.email, credencial.telefone, credencial.senha);

      const idProprietario = await this.repo.salvarComTransacao(proprietario, tx);

      let pessoaDTO: PessoaDTO;

      if (dados.tipoPessoa === "fisica") {
        pessoaDTO = {
          id: idProprietario,
          idAdministrador: idAdminRoot,
          nome: dados.nome,
          cpf: dados.cpf,
          endereco: dados.endereco,
          dataCadastro: dados.dataCadastro
        };
      } else {
        pessoaDTO = {
          id: idProprietario,
          idAdministrador: idAdminRoot,
          razaoSocial: dados.razaoSocial,
          cnpj: dados.cnpj,
          inscrEstadual: dados.inscrEstadual,
          endereco: dados.endereco,
          dataCadastro: dados.dataCadastro
        };
      }
      return pessoaDTO;
    });
  }

  public async criarEndereco(dados: Record<string, unknown>, pessoaId: number, idUsuario: number): Promise<Endereco> {
    return await this.prisma.$transaction(async (tx) => {
      await this.validarProprietario(pessoaId, idUsuario, tx);
      const endereco = new Endereco(
        dados.cidade as string,
        dados.bairro as string,
        dados.cep as string,
        dados.uf as string,
        (dados.pais as string) || "Brasil",
        dados.logradouro as string,
        pessoaId
      );

      return await this.pessoaRepo.cadastrarEndereco(endereco, pessoaId, tx);
    });
  }

  public async removerEndereco(pessoaId: number, idUsuario: number): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      await this.validarProprietario(pessoaId, idUsuario, tx);
      await this.pessoaRepo.removerEndereco(pessoaId, tx);
    });
  }
  public async atualizarEndereco(pessoaId: number, dados: Record<string, unknown>, idUsuario: number): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      await this.validarProprietario(pessoaId, idUsuario, tx);
      const endereco = new Endereco(
        dados.cidade as string,
        dados.bairro as string,
        dados.cep as string,
        dados.uf as string,
        (dados.pais as string) || "Brasil",
        dados.logradouro as string,
        pessoaId,
      );
      await this.pessoaRepo.atualizarEndereco(endereco, pessoaId, tx);
    });
  }

  public async atualizarSenha(senha: string, pessoaId: number, idUsuario: number) {
    return await this.prisma.$transaction(async (tx) => {
      if (typeof senha !== "string" || senha.trim() === "") {
        throw new Error("A senha é obrigatória.");
      }
      if (senha.length < 8) {
        throw new Error("A senha deve conter pelo menos 8 caracteres.");
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/.test(senha)) {
        throw new Error("A senha deve conter maiúscula, minúscula, número e símbolo.");
      }

      const salt = await bcrypt.genSalt(12);
      const novaSenhaCriptografada = await bcrypt.hash(senha, salt);
      await this.validarProprietario(pessoaId, idUsuario, tx);
      await this.repo.updateSenhaProprietario(novaSenhaCriptografada, pessoaId, tx);
    })
  }

  public async atualizarEmail(email: string, pessoaId: number, idUsuario: number) {
    await this.prisma.$transaction(async (tx) => {
      await this.validarProprietario(pessoaId, idUsuario, tx);
      if (await this.usuarioRepo.verificarEmailExistente(email, tx)) {
        throw new Error(`O e-mail ${email} já está em uso.`);
      }
      await this.repo.updateEmailProprietario(email, pessoaId, tx);
    });
  }

  public async atualizarTelefone(telefone: string, pessoaId: number, idUsuario: number) {
    await this.prisma.$transaction(async (tx) => {
      await this.validarProprietario(pessoaId, idUsuario, tx);
      if (await this.usuarioRepo.verificarTelefoneExistente(telefone, tx)) {
        throw new Error(`O telefone ${telefone} já está em uso.`);
      }
      await this.repo.updateTelefoneProprietario(telefone, pessoaId, tx);
    });
  }

  public async atualizarNomeOuRazaoSocial(dados: Record<string, unknown>, pessoaId: number, idUsuario: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const proprietario = await this.validarProprietario(pessoaId, idUsuario, tx);
      const perfil = proprietario.perfil;

      if (perfil instanceof PessoaFisica) {
        const novoNome = dados.nome as string;
        if (!novoNome || novoNome.trim() === "") throw new Error("Nome é obrigatório.");
        if (novoNome.length < 3) throw new Error("Nome deve ter no mínimo 3 caracteres.");
        if (novoNome.length > 100) throw new Error("Nome deve ter no máximo 100 caracteres.");

        await this.pessoaRepo.atualizarNomePessoaFisica(perfil.cpf, novoNome, idUsuario, tx);
      } else if (perfil instanceof PessoaJuridica) {
        const novaRazaoSocial = dados.razaoSocial as string;
        if (!novaRazaoSocial || novaRazaoSocial.trim() === "") throw new Error("Razão Social é obrigatória.");
        if (novaRazaoSocial.length < 3) throw new Error("Razão Social deve ter no mínimo 3 caracteres.");
        if (novaRazaoSocial.length > 100) throw new Error("Razão Social deve ter no máximo 100 caracteres.");

        await this.pessoaRepo.atualizarRazaoSocial(perfil.cnpj, novaRazaoSocial, idUsuario, tx);
      } else {
        throw new Error("Tipo de pessoa inválido.");
      }
    });
  }

  public async atualizarInscricaoEstadual(inscricaoEstadual: string, pessoaId: number, idUsuario: number) {
    await this.prisma.$transaction(async (tx) => {
      if (!inscricaoEstadual || typeof inscricaoEstadual !== "string" || inscricaoEstadual.trim() === "") {
        throw new Error("A Inscrição Estadual deve ser informada.");
      }
      if (!pessoaId) {
        throw new Error("O ID do proprietário é obrigatório.");
      }
      await this.validarProprietario(pessoaId, idUsuario, tx);
      await this.pessoaRepo.atualizarInscricaoEstadualPorPessoaId(pessoaId, inscricaoEstadual, tx);
    });
  }

  public async getProprietarioEEndereco(pessoaId: number, idUsuario: number) {
    return await this.prisma.$transaction(async (tx) => {
      const proprietario = await this.validarProprietario(pessoaId, idUsuario, tx);
      const tipoConta = proprietario.perfil instanceof PessoaJuridica ? "juridica" : "fisica";
      const dados = proprietario.toJSON();

      return {
        ...dados,
        tipoConta,
      };
    });
  }

  public async deletarProprietario(pessoaId: number, idUsuario: number) {
    await this.prisma.$transaction(async (tx) => {
      await this.validarProprietario(pessoaId, idUsuario, tx);
      await this.repo.deletarProprietario(pessoaId, tx);
    });
  }
}