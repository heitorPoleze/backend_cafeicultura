import ProprietarioRepository from "./proprietario.repository";
import Proprietario from "./proprietario.entity";
import PessoaFactory from "../../shared/domain/pessoa/pessoafactory.entity";
import Pessoa from "../../shared/domain/pessoa/pessoabase.entity";
import { CreateProprietarioDTO } from "./proprietario.dto";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import UsuarioRepository from "../usuario/usuario.repository";
import Usuario from "../usuario/usuario.entity";

class ProprietarioService {
  constructor(
    private readonly repo: ProprietarioRepository,
    private readonly pessoaRepo: PessoaRepository,
    private readonly usuarioRepo: UsuarioRepository,
  ) {};

  public async cadastrar(dados: CreateProprietarioDTO): Promise<number> {
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
    return await this.repo.salvarComTransacao(proprietario);
  };

  public async criarEndereco(
    dados: Record<string, unknown>,
    pessoaId: number,
  ): Promise<number> {
    const endereco = new Endereco(
      dados.cidade as string,
      dados.bairro as string,
      dados.cep as string,
      dados.uf as string,
      (dados.pais as string) || "Brasil",
      dados.logradouro as string,
      pessoaId,
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
};

export default ProprietarioService;