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
export default class ProprietarioService {
  constructor(
    private repo: ProprietarioRepository,
    private pessoaRepo: PessoaRepository,
    private usuarioRepo: UsuarioRepository
  ) { }

  //REVISÃO: HEITOR 23/06/2026-> aqui é uma decisão arquitetural que não posso tomar sozinho. Você está fazendo múltiplas consultas ao Banco, porém mantém o código limpo. Uma outra decisão poderia ser verificar essas duplicatas no próprio repositório na função criar. O código P2002 do Prisma ocorre quando ele identifica uma duplicata. Poderíamos trabalhar nisso caso o sistema cresça para milhares de usuários.
  public async cadastrar(dados: CreateProprietarioDTO):Promise<PessoaDTO>{

    if (dados.tipoPessoa === "fisica") {
      const cpfExistente = await this.pessoaRepo.verificarCpfExistente(
        dados.cpf!,
      );
      if (cpfExistente) {
        throw new Error(`CPF_EXISTENTE`);
      };
    } else if (dados.tipoPessoa === "juridica") {
      const cnpjExistente = await this.pessoaRepo.verificarCnpjExistente(
        dados.cnpj!,
      );
      if (cnpjExistente) {
        throw new Error(`CNPJ_EXISTENTE`);
      };
      let inscricaoExistente;
      if(dados.inscrEstadual != null){
      inscricaoExistente = await this.usuarioRepo.verificarInscricaoEstadualExistente(
      dados.inscrEstadual,
    );}
    if (inscricaoExistente) {
      throw new Error(`INSCRICAO_EXISTENTE`);
    };

    };

    const emailExistente = await this.usuarioRepo.verificarEmailExistente(
      dados.email,
    );
    if (emailExistente) {
      throw new Error(`EMAIL_EXISTENTE`);
    };

    const telefoneExistente = await this.usuarioRepo.verificarTelefoneExistente(
      dados.telefone,
    );
    if (telefoneExistente) {
      throw new Error(`TELEFONE_EXISTENTE`);
    };
    
   
    const perfil = PessoaFactory.criarPessoa(dados.tipoPessoa, dados);

    const credencial = new Usuario(
      dados.email,
      dados.telefone,
      dados.senha,
      perfil,
    );
    await credencial.criptografarSenha();

    const proprietario = new Proprietario(
      perfil,
      credencial.email,
      credencial.telefone,
      credencial.senha,
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

  public async atualizarEndereco(
    pessoaId: number,
    dados: Record<string, unknown>,
  ): Promise<void> {
    const endereco = new Endereco(
      dados.cidade as string,
      dados.bairro as string,
      dados.cep as string,
      dados.uf as string,
      (dados.pais as string) || "Brasil",
      dados.logradouro as string,
      pessoaId,
    );
    await this.pessoaRepo.atualizarEndereco(endereco, pessoaId);
  };

  public async atualizarSenha(senha: string, pessoaId: number) {
    if (typeof senha !== "string" || senha.trim() === "") {
      throw new Error("A senha é obrigatória.");
    }

    if (senha.length < 8) {
      throw new Error("A senha deve conter pelo menos 8 caracteres.");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/.test(senha)) {
      throw new Error("A senha deve conter maiúscula, minúscula, número e símbolo.");
    }

    const salt = await bcrypt.genSalt(10);
    const novaSenhaCriptografada = await bcrypt.hash(senha, salt);
    await this.repo.updateSenhaProprietario(novaSenhaCriptografada, pessoaId);
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
  public async atualizarInscricaoEstadual(inscricaoEstadual: string, cnpj: string | undefined, pessoaId?: number) {
    if (!inscricaoEstadual || typeof inscricaoEstadual !== "string" || inscricaoEstadual.trim() === "") {
      throw new Error("A Inscrição Estadual deve ser informada.");
    }

    if (!pessoaId) {
      throw new Error("O ID do proprietário é obrigatório.");
    }

    const proprietario = await this.repo.buscarPorId(pessoaId);

    if (!proprietario || !(proprietario.perfil instanceof PessoaJuridica)) {
      throw new Error(`Proprietário jurídico com ID ${pessoaId} não encontrado.`);
    }

    await this.pessoaRepo.atualizarInscricaoEstadualPorPessoaId(pessoaId, inscricaoEstadual);
  }
public async getProprietarioEEndereco(pessoaId: number) {
  const proprietario = await this.repo.buscarPorId(pessoaId);
   if (!proprietario) {
       throw new Error(`Proprietário com ID ${pessoaId} não encontrado.`);
     }

  const tipoConta = proprietario.perfil instanceof PessoaJuridica ? "juridica" : "fisica";
  const dados = proprietario.toJSON();

  return {
    ...dados,
    tipoConta,
  };
}
public async deletarProprietario(pessoaId: number) {
  const proprietario = await this.repo.buscarPorId(pessoaId);
  if (!proprietario) {
    throw new Error(`Proprietário com ID ${pessoaId} não encontrado.`);
  }
  await this.repo.deletarProprietario(pessoaId);
}
}