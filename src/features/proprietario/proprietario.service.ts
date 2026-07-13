import ProprietarioRepository from "./proprietario.repository";
import Proprietario from "./proprietario.entity";
import Credencial from "../auth/auth.entity";
import PessoaFactory from "../../shared/domain/pessoa/pessoafactory.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import { CreateProprietarioDTO } from "./proprietario.dto";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import UsuarioRepository from "../usuario/usuario.repository";
import Usuario from "../usuario/usuario.entity";
import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";
import bcrypt from "bcryptjs";
import PessoaDTO from "../../shared/domain/pessoa/pessoa.dto";

export default class ProprietarioService {
  constructor(
    private repo: ProprietarioRepository,
    private pessoaRepo: PessoaRepository,
    private usuarioRepo: UsuarioRepository
  ) { }

  //REVISÃO: HEITOR 23/06/2026-> aqui é uma decisão arquitetural que não posso tomar sozinho. Você está fazendo múltiplas consultas ao Banco, porém mantém o código limpo. Uma outra decisão poderia ser verificar essas duplicatas no próprio repositório na função criar. O código P2002 do Prisma ocorre quando ele identifica uma duplicata. Poderíamos trabalhar nisso caso o sistema cresça para milhares de usuários.
  public async cadastrar(dados: CreateProprietarioDTO):Promise<PessoaDTO>{

    if (dados.tipoPessoa === "fisica") {
      const cpfExistente = await this.pessoaRepo.verificarCpfExistente(dados.cpf!);
      if (cpfExistente) {
        throw new Error(`Já existe um proprietário cadastrado com o CPF: ${dados.cpf}`);
      }
    } else if (dados.tipoPessoa === "juridica") {
      const cnpjExistente = await this.pessoaRepo.verificarCnpjExistente(dados.cnpj!);
      if (cnpjExistente) {
        throw new Error(`Já existe um proprietário cadastrado com o CNPJ: ${dados.cnpj}`);
      };
    };

    const emailExistente = await this.usuarioRepo.verificarEmailExistente(dados.email);
    if (emailExistente) {
      throw new Error(`O e-mail ${dados.email} já está em uso.`);
    };

    const telefoneExistente = await this.usuarioRepo.verificarTelefoneExistente(dados.telefone);
    if (telefoneExistente) {
      throw new Error(`O telefone ${dados.telefone} já está em uso.`);
    };

    const perfil: Pessoa = PessoaFactory.criarPessoa(dados.tipoPessoa, dados);

    const credencial = new Usuario(dados.email, dados.telefone, dados.senha, perfil);
    await credencial.criptografarSenha();

    const proprietario = new Proprietario(
      perfil,
      credencial.email,
      credencial.telefone,
      credencial.senha
    );
   const idProprietario = await this.repo.salvarComTransacao(proprietario);
  let pessoaDTO: PessoaDTO;

  if (dados.tipoPessoa === "fisica") {
    pessoaDTO = {
      id: idProprietario,
      nome: dados.nome,
      cpf: dados.cpf,
      endereco: dados.endereco,
      dataCadastro: dados.dataCadastro
    };
  } else {
    pessoaDTO = {
      id: idProprietario,
      razaoSocial: dados.razaoSocial,
      cnpj: dados.cnpj,
      inscrEstadual: dados.inscrEstadual,
      endereco: dados.endereco,
      dataCadastro: dados.dataCadastro
    };
  }
  return pessoaDTO
  }

  public async criarEndereco(dados: Record<string, unknown>, pessoaId: number): Promise<Endereco> {
    const endereco = new Endereco(
      dados.cidade as string,
      dados.bairro as string,
      dados.cep as string,
      dados.uf as string,
      (dados.pais as string) || "Brasil",
      dados.logradouro as string,
      pessoaId
    );
    return await this.pessoaRepo.cadastrarEndereco(endereco, pessoaId);
  };

  public async removerEndereco(pessoaId: number): Promise<void> {
    await this.pessoaRepo.removerEndereco(pessoaId);
  };

  public async atualizarEndereco(pessoaId: number, dados: Record<string, unknown>): Promise<void> {
    const endereco = new Endereco(
      dados.cidade as string,
      dados.bairro as string,
      dados.cep as string,
      dados.uf as string,
      (dados.pais as string) || "Brasil",
      dados.logradouro as string,
      pessoaId
    );
    await this.pessoaRepo.atualizarEndereco(endereco, pessoaId);
  };

  public async atualizarSenha(senha: string, pessoaId: number) {
    const salt = await bcrypt.genSalt(10);
    const novaSenhaCriptografada = await bcrypt.hash(senha, salt);
    this.repo.updateSenhaProprietario(novaSenhaCriptografada, pessoaId)
  }

  //Precisa verificar se o e-mail/telefone já está em uso e retornar uma mensagem de erro compatível para retornarmos a mensagem para a api, assim como o método cadastrar dessa mesma classe.
  public async atualizarEmail(email: string, pessoaId: number) {
    if(await this.usuarioRepo.verificarEmailExistente(email)){
      throw new Error(`O e-mail ${email} já está em uso.`);
    }
    this.repo.updateEmailProprietario(email, pessoaId)
  }
  public async atualizarTelefone(telefone: string, pessoaId: number) {
    if(await this.usuarioRepo.verificarTelefoneExistente(telefone)){
      throw new Error(`O telefone ${telefone} já está em uso.`);
    }
    this.repo.updateTelefoneProprietario(telefone, pessoaId)
  }
  public async atualizarNomeOuRazaoSocial(dados: Record<string, unknown>, pessoaId: number): Promise<void> {
    const proprietario = await this.repo.buscarPorId(pessoaId);

    if (!proprietario) {
      throw new Error(`Proprietário com ID ${pessoaId} não encontrado.`);
    }

    const perfil = proprietario.perfil;

    if (perfil instanceof PessoaFisica) {
      const novoNome = dados.nome as string;
      if (!novoNome || novoNome.trim() === "") {
        throw new Error("Nome é obrigatório.");
      }
      if (novoNome.length < 3) {
        throw new Error("Nome deve ter no mínimo 3 caracteres.");
      }
      if (novoNome.length > 100) {
        throw new Error("Nome deve ter no máximo 100 caracteres.");
      }
      await this.pessoaRepo.atualizarNomePessoaFisica(perfil.cpf, novoNome);
    } else if (perfil instanceof PessoaJuridica) {
      const novaRazaoSocial = dados.razaoSocial as string;

      if (!novaRazaoSocial || novaRazaoSocial.trim() === "") {
        throw new Error("Razão Social é obrigatória.");
      }
      if (novaRazaoSocial.length < 3) {
        throw new Error("Razão Social deve ter no mínimo 3 caracteres.");
      }
      if (novaRazaoSocial.length > 100) {
        throw new Error("Razão Social deve ter no máximo 100 caracteres.");
      }
      await this.pessoaRepo.atualizarRazaoSocial(
        perfil.cnpj,
        novaRazaoSocial,
      );
    } else {
      throw new Error("Tipo de pessoa inválido.");
    }
  }
  public async atualizarInscricaoEstadual(inscricaoEstadual: string,cnpj?: string,pessoaId?: number) {
    let _cnpj = cnpj;

    if (!_cnpj && pessoaId) {
      const proprietario = await this.repo.buscarPorId(pessoaId);

      if (!(proprietario instanceof PessoaJuridica)) {
        throw new Error(`Proprietário juridico com ID ${pessoaId} não encontrado.`);
      }

      _cnpj = proprietario.cnpj;
    }

    if (!_cnpj) {
      throw new Error('CNPJ não informado nem encontrado a partir do pessoaId.');
    }

    await this.repo.updateInscricaoEstadual(inscricaoEstadual, _cnpj);
  }
public async getProprietarioEEndereco(pessoaId: number) {
  const proprietario = await this.repo.buscarPorId(pessoaId);
   if (!proprietario) {
       throw new Error(`Proprietário com ID ${pessoaId} não encontrado.`);
     }
  return proprietario;
}
}