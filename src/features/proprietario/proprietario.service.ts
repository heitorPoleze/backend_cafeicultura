import ProprietarioRepository from "./proprietario.repository";
import Proprietario from "./proprietario.entity";
import Credencial from "../auth/auth.entity";
import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";
import Pessoa from "../../shared/domain/pessoa/pessoa.entity";
import { CreateProprietarioDTO, ReturnProprietarioDTO, UpdateProprietarioDTO } from "./proprietario.dto";
import Endereco from "../../shared/domain/endereco/endereco.vo";

export default class ProprietarioService {
  constructor(private repo: ProprietarioRepository) {}

  public async cadastrar(dados: CreateProprietarioDTO): Promise<number> {
    // 0. Validar duplicação de CPF/CNPJ
    if (dados.tipoPessoa === "fisica") {
      const cpfExistente = await this.repo.verificarCPFExistente(dados.cpf!);
      if (cpfExistente) {
        throw new Error(`Já existe um proprietário cadastrado com o CPF: ${dados.cpf}`);
      }
    } else if (dados.tipoPessoa === "juridica") {
      const cnpjExistente = await this.repo.verificarCNPJExistente(dados.cnpj!);
      if (cnpjExistente) {
        throw new Error(`Já existe um proprietário cadastrado com o CNPJ: ${dados.cnpj}`);
      }
    }

    // 1. Determinar e instanciar o perfil (PF ou PJ)
    let perfil: Pessoa;
    if (dados.tipoPessoa === "fisica") {
      perfil = new PessoaFisica(dados.nome!, dados.cpf!);
    } else if (dados.tipoPessoa === "juridica") {
      perfil = new PessoaJuridica(dados.razaoSocial!, dados.cnpj!, dados.inscrEstadual);
    } else {
      throw new Error("Tipo de pessoa inválido.");
    }
    // instanciar credencial
    const credencial = new Credencial(dados.email as string, dados.telefone as string, dados.senha as string);
    await credencial.criptografarSenha();
    const proprietario = new Proprietario(
      perfil,
      credencial.email,
      credencial.telefone,
      credencial.senha
    );
    return await this.repo.salvarComTransacao(proprietario, credencial);
  }

  public async buscarPorId(id: number): Promise<ReturnProprietarioDTO | null> {
    const proprietario = await this.repo.buscarPorId(id);
    if (!proprietario) return null;

    return {
      id: proprietario.idPessoa!,
      nomeExibicao: proprietario.nomeExibicao,
      tipoPessoa: proprietario.tipoUser,
      email: proprietario.email,
      telefone: proprietario.telefone,
      documentos: proprietario.documentos || [],
      dataCadastro: proprietario.perfil.dataCadastro,
      endereco: proprietario.endereco
        ? {
            idEndereco: proprietario.endereco.idEndereco || 0,
            cidade: proprietario.endereco.cidade,
            bairro: proprietario.endereco.bairro,
            cep: proprietario.endereco.cep,
            uf: proprietario.endereco.uf,
            pais: proprietario.endereco.pais,
            logradouro: proprietario.endereco.logradouro,
          }
        : undefined,
    };
  }

  public async criarEndereco(dados: Record<string, unknown>, pessoaId: number): Promise<number> {
    const endereco = new Endereco(
      dados.cidade as string,
      dados.bairro as string,
      dados.cep as string || dados.cep as string,
      dados.uf as string || dados.uf as string,
      dados.pais as string || "Brasil",
      dados.logradouro as string,
      pessoaId // O ID será o próprio pessoaId no banco
    );
    return await this.repo.cadastrarEndereco(endereco, pessoaId);
  }

  public async removerEndereco(pessoaId: number): Promise<void> {
    await this.repo.removerEndereco(pessoaId);
  }

  public async excluir(id: number): Promise<void> {
    const proprietario = await this.repo.buscarPorId(id);
    if (!proprietario) {
      throw new Error("Proprietário não encontrado para exclusão.");
    }
    if (proprietario.endereco) {
      await this.repo.removerEndereco(id);
    }
    await this.repo.excluir(id);
  }
  
  public async atualizar(id: number, dados: UpdateProprietarioDTO): Promise<void> {
    const existente = await this.repo.buscarPorId(id);
    if (!existente) {
      throw new Error("Proprietário não encontrado para atualização.");
    }

    // 1. Preparar credenciais (tratar senha se fornecida)
    let senhaFinal = existente.credencial.senha;
    if (dados.senha) {
      const cred = new Credencial(dados.email as string || existente.email as string, dados.telefone as string || existente.telefone as string, dados.senha as string);
      await cred.criptografarSenha();
      senhaFinal = cred.senha;
    }

    // 2. Atualizar Perfil (PF ou PJ)
    let perfil: Pessoa;
    if (existente.tipoUser === "PF") {
      const pfAtual = existente.perfil as PessoaFisica;
      perfil = new PessoaFisica(
        dados.nome as string ?? pfAtual.nomeExibicao,
        pfAtual.cpf,
        pfAtual.dataCadastro,
        id,
        pfAtual.endereco
      );
    } else {
      const pjAtual = existente.perfil as PessoaJuridica;
      perfil = new PessoaJuridica(
        dados.razaoSocial as string?? pjAtual.razaoSocial,
        pjAtual.cnpj,
        dados.inscrEstadual as string ?? pjAtual.inscricaoEstadual,
        pjAtual.dataCadastro,
        id,
        pjAtual.endereco
      );
    }

    const proprietarioAtualizado = new Proprietario(
      perfil,
      dados.email as string ?? existente.email as string,
      dados.telefone as string ?? existente.telefone as string,
      senhaFinal
    );

    await this.repo.atualizarProprietario(proprietarioAtualizado);
  }

  public async atualizarEndereco(pessoaId: number, dados: Record<string, unknown>): Promise<void> {
    const endereco = new Endereco(
      dados.cidade as string,
      dados.bairro as string,
      dados.cep as string || dados.cep as string,
      dados.uf as string || dados.uf as string,
      dados.pais as string || "Brasil",
      dados.logradouro as string,
      pessoaId
    );
    await this.repo.atualizarEndereco(endereco, pessoaId);
  }
}