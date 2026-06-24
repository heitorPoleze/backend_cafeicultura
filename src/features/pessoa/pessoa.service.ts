import ClienteRepo from "../../shared/domain/pessoa/cliente/cliente.repository";
import FornecedorRepo from "../../shared/domain/pessoa/fornecedor/fornecedor.repository";
import FuncionarioRepo from "../../shared/domain/pessoa/funcionario/funcionario.repository";
import MeeiroRepo from "../../shared/domain/pessoa/meeiro/meeiro.repository";
import PrestadorRepo from "../../shared/domain/pessoa/prestadordeservico/prestador.repository";
import PessoaRepo from "../../shared/domain/pessoa/pessoa.repository";
import PessoaFactory from "../../shared/domain/pessoa/pessoafactory.entity";
import {
    ClienteResponseDTO,
  CreateClienteDTO,
  CreateFornecedorDTO,
  CreateFuncionarioDTO,
  CreateMeeiroDTO,
  CreatePessoaDTO,
  CreatePrestadorDTO,
  FornecedorResponseDTO,
  FuncionarioResponseDTO,
  MeeiroResponseDTO,
  PrestadorResponseDTO,
  updateSalarioFuncionarioDTO,
} from "./pessoa.dto";
import Cliente from "../../shared/domain/pessoa/cliente/cliente.entity";
import Fornecedor from "../../shared/domain/pessoa/fornecedor/fornecedor.entity";
import Funcionario from "../../shared/domain/pessoa/funcionario/funcionario.entity";
import Meeiro from "../../shared/domain/pessoa/meeiro/meeiro.entity";
import Prestador from "../../shared/domain/pessoa/prestadordeservico/prestador.entity";
import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoa/pessoajuridica.entity";

class PessoaService {
  constructor(
    private readonly clienteRepo: ClienteRepo,
    private readonly fornecedorRepo: FornecedorRepo,
    private readonly funcionarioRepo: FuncionarioRepo,
    private readonly meeiroRepo: MeeiroRepo,
    private readonly prestadorRepo: PrestadorRepo,
    private readonly pessoaRepo: PessoaRepo,
  ) {}

  private async verificarCadastro(dados: CreatePessoaDTO, entidade: string) {
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
  };

  public async cadastrarCliente(c: CreateClienteDTO) {
    await this.verificarCadastro(c, "cliente");
    const cliente = new Cliente(PessoaFactory.criarPessoa(c.tipoPessoa, c));
    return await this.clienteRepo.salvarComTransacao(cliente);
  };

  public async cadastrarFornecedor(f: CreateFornecedorDTO) {
    await this.verificarCadastro(f, "fornecedor");
    const fornecedor = new Fornecedor(
      PessoaFactory.criarPessoa(f.tipoPessoa, f),
    );
    return await this.fornecedorRepo.salvarComTransacao(fornecedor);
  };

  public async cadastrarFuncionario(f: CreateFuncionarioDTO) {
    await this.verificarCadastro(f, "funcionário");
    const funcionario = new Funcionario(
      PessoaFactory.criarPessoa(f.tipoPessoa, f),
      f.ctps,
      f.salario,
    );
    return await this.funcionarioRepo.salvarComTransacao(funcionario);
  };

  public async atualizarFuncionarioSalario(dto: updateSalarioFuncionarioDTO) {
    const f = await this.funcionarioRepo.buscarPorId(dto.id);
    if (!f) {
      throw new Error("NAO_ENCONTRADO");
    };
    f.salario = dto.salario;
    const resultado = await this.funcionarioRepo.atualizarSalario(dto.id, f.salario);
    if (!resultado) {
      throw new Error("NAO_ATUALIZADO");
    };
    return resultado;
  };

  public async cadastrarMeeiro(m: CreateMeeiroDTO) {
    await this.verificarCadastro(m, "meeiro");
    const meeiro = new Meeiro(PessoaFactory.criarPessoa(m.tipoPessoa, m));
    return await this.meeiroRepo.salvarComTransacao(meeiro);
  };

  public async cadastrarPrestador(p: CreatePrestadorDTO) {
    await this.verificarCadastro(p, "prestador de serviço");
    const prestador = new Prestador(PessoaFactory.criarPessoa(p.tipoPessoa, p));
    return await this.prestadorRepo.salvarComTransacao(prestador);
  };

  public async buscarClientePorId(idCliente: number): Promise<ClienteResponseDTO> {
    const c = await this.clienteRepo.buscarPorId(idCliente);
    if (!c) {
      throw new Error("NAO_ENCONTRADO");
    };

    if (c.pessoa instanceof PessoaFisica) {
      return {
        id: c.pessoa.id!,
        dataCadastro: c.pessoa.dataCadastro,
        nome: c.pessoa.nome,
        cpf: c.pessoa.cpf,
        endereco: c.pessoa.endereco,
      };
    } else if (c.pessoa instanceof PessoaJuridica) {
      return {
        id: c.pessoa.id!,
        dataCadastro: c.pessoa.dataCadastro,
        razaoSocial: c.pessoa.razaoSocial,
        cnpj: c.pessoa.cnpj,
        inscrEstadual: c.pessoa.inscrEstadual,
        endereco: c.pessoa.endereco,
      };
    } else {
        throw new Error("ERRO_AO_BUSCAR");
    };
  };

  public async buscarFornecedorPorId(
    idFornecedor: number,
  ): Promise<FornecedorResponseDTO> {
    const f = await this.fornecedorRepo.buscarPorId(idFornecedor);
    if (!f) {
      throw new Error("NAO_ENCONTRADO");
    };

    if (f.pessoa instanceof PessoaFisica) {
      return {
        id: f.pessoa.id!,
        dataCadastro: f.pessoa.dataCadastro,
        nome: f.pessoa.nome,
        cpf: f.pessoa.cpf,
        endereco: f.pessoa.endereco,
      };
    } else if (f.pessoa instanceof PessoaJuridica) {
      return {
        id: f.pessoa.id!,
        dataCadastro: f.pessoa.dataCadastro,
        razaoSocial: f.pessoa.razaoSocial,
        cnpj: f.pessoa.cnpj,
        inscrEstadual: f.pessoa.inscrEstadual,
        endereco: f.pessoa.endereco,
      };
    } else {
        throw new Error("ERRO_AO_BUSCAR");
    }
  };

  public async buscarFuncionarioPorId(
    idFuncionario: number,
  ): Promise<FuncionarioResponseDTO> {
    const f = await this.funcionarioRepo.buscarPorId(idFuncionario);
    if (!f) {
      throw new Error("NAO_ENCONTRADO");
    };

    if (f.pessoa instanceof PessoaFisica) {
      return {
        id: f.pessoa.id!,
        dataCadastro: f.pessoa.dataCadastro,
        nome: f.pessoa.nome,
        cpf: f.pessoa.cpf,
        endereco: f.pessoa.endereco,
        ctps: f.ctps,
        salario: f.salario,
      };
    } else {
        throw new Error("ERRO_AO_BUSCAR");
    };
  };

  public async buscarMeeiroPorId(idMeeiro: number): Promise<MeeiroResponseDTO> {
    const m = await this.meeiroRepo.buscarPorId(idMeeiro);
    if (!m) {
      throw new Error("NAO_ENCONTRADO");
    };
    if (m.pessoa instanceof PessoaFisica) {
      return {
        id: m.pessoa.id!,
        dataCadastro: m.pessoa.dataCadastro,
        nome: m.pessoa.nome,
        cpf: m.pessoa.cpf,
        endereco: m.pessoa.endereco
      };
    } else {
        throw new Error("ERRO_AO_BUSCAR");
    };
  };

  public async buscarPrestadorPorId(idPrestador: number): Promise<PrestadorResponseDTO> {
    const p = await this.prestadorRepo.buscarPorId(idPrestador);
    if (!p) {
      throw new Error("NAO_ENCONTRADO");
    };
    if (p.pessoa instanceof PessoaFisica) {
      return {
        id: p.pessoa.id!,
        dataCadastro: p.pessoa.dataCadastro,
        nome: p.pessoa.nome,
        cpf: p.pessoa.cpf,
        endereco: p.pessoa.endereco
      };
    } else {
        throw new Error("ERRO_AO_BUSCAR");
    };
  };
};

export default PessoaService;
