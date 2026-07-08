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
  ListarPessoasDTO,
  MeeiroResponseDTO,
  PessoaFisicaResponseDTO,
  PessoaJuridicaResponseDTO,
  PessoaResponseDTO,
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

  private async verificarCadastro(dados: CreatePessoaDTO) {
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
    await this.verificarCadastro(c);
    const cliente = new Cliente(PessoaFactory.criarPessoa(c.tipoPessoa, c));
    return await this.clienteRepo.salvarComTransacao(cliente);
  };

  public async cadastrarFornecedor(f: CreateFornecedorDTO) {
    await this.verificarCadastro(f);
    const fornecedor = new Fornecedor(
      PessoaFactory.criarPessoa(f.tipoPessoa, f),
    );
    return await this.fornecedorRepo.salvarComTransacao(fornecedor);
  };

  public async cadastrarFuncionario(f: CreateFuncionarioDTO) {
    await this.verificarCadastro(f);
    const funcionario = new Funcionario(
      PessoaFactory.criarPessoa(f.tipoPessoa, f),
      f.ctps,
      f.salario,
    );
    return await this.funcionarioRepo.salvarComTransacao(funcionario);
  };

  public async atualizarFuncionarioSalario(dto: updateSalarioFuncionarioDTO, idUsuarioSessao: number) {

    const f = await this.funcionarioRepo.buscarPorId(dto.id);
    if (!f) {
      throw new Error("NAO_ENCONTRADO");
    };

    if (f.pessoa.idAdministrador !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };

    f.salario = dto.salario;
    const resultado = await this.funcionarioRepo.atualizarSalario(dto.id, f.salario);
    if (!resultado) {
      throw new Error("NAO_ATUALIZADO");
    };
    return resultado;
  };

  public async cadastrarMeeiro(m: CreateMeeiroDTO) {
    await this.verificarCadastro(m);
    const meeiro = new Meeiro(PessoaFactory.criarPessoa(m.tipoPessoa, m));
    return await this.meeiroRepo.salvarComTransacao(meeiro);
  };

  public async cadastrarPrestador(p: CreatePrestadorDTO) {
    await this.verificarCadastro(p);
    const prestador = new Prestador(PessoaFactory.criarPessoa(p.tipoPessoa, p));
    return await this.prestadorRepo.salvarComTransacao(prestador);
  };

  public async buscarClientePorId(idCliente: number, idUsuarioSessao: number): Promise<ClienteResponseDTO> {
    const c = await this.clienteRepo.buscarPorId(idCliente);
    if (!c) {
      throw new Error("NAO_ENCONTRADO");
    };

    if (c.pessoa.idAdministrador !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };

    if (c.pessoa instanceof PessoaFisica) {
      return {
        id: c.pessoa.id!,
        idAdministrador: c.pessoa.idAdministrador,
        dataCadastro: c.pessoa.dataCadastro,
        nome: c.pessoa.nome,
        cpf: c.pessoa.cpf,
        endereco: c.pessoa.endereco,
      };
    } else if (c.pessoa instanceof PessoaJuridica) {
      return {
        id: c.pessoa.id!,
        idAdministrador: c.pessoa.idAdministrador,
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
    idUsuarioSessao: number
  ): Promise<FornecedorResponseDTO> {
    const f = await this.fornecedorRepo.buscarPorId(idFornecedor);
    if (!f) {
      throw new Error("NAO_ENCONTRADO");
    };

    if (f.pessoa.idAdministrador !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };

    if (f.pessoa instanceof PessoaFisica) {
      return {
        id: f.pessoa.id!,
        idAdministrador: f.pessoa.idAdministrador,
        dataCadastro: f.pessoa.dataCadastro,
        nome: f.pessoa.nome,
        cpf: f.pessoa.cpf,
        endereco: f.pessoa.endereco,
      };
    } else if (f.pessoa instanceof PessoaJuridica) {
      return {
        id: f.pessoa.id!,
        idAdministrador: f.pessoa.idAdministrador,
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
    idUsuarioSessao: number
  ): Promise<FuncionarioResponseDTO> {
    const f = await this.funcionarioRepo.buscarPorId(idFuncionario);
    if (!f) {
      throw new Error("NAO_ENCONTRADO");
    };

    if (f.pessoa.idAdministrador !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };

    if (f.pessoa instanceof PessoaFisica) {
      return {
        id: f.pessoa.id!,
        idAdministrador: f.pessoa.idAdministrador,
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

  public async buscarMeeiroPorId(idMeeiro: number, idUsuarioSessao: number): Promise<MeeiroResponseDTO> {
    const m = await this.meeiroRepo.buscarPorId(idMeeiro);
    if (!m) {
      throw new Error("NAO_ENCONTRADO");
    };
    if (m.pessoa.idAdministrador !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };
    if (m.pessoa instanceof PessoaFisica) {
      return {
        id: m.pessoa.id!,
        idAdministrador: m.pessoa.idAdministrador,
        dataCadastro: m.pessoa.dataCadastro,
        nome: m.pessoa.nome,
        cpf: m.pessoa.cpf,
        endereco: m.pessoa.endereco
      };
    } else {
        throw new Error("ERRO_AO_BUSCAR");
    };
  };

  public async buscarPrestadorPorId(idPrestador: number, idUsuarioSessao: number): Promise<PrestadorResponseDTO> {
    const p = await this.prestadorRepo.buscarPorId(idPrestador);
    if (!p) {
      throw new Error("NAO_ENCONTRADO");
    };

    if (p.pessoa.idAdministrador !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };
    if (p.pessoa instanceof PessoaFisica) {
      return {
        id: p.pessoa.id!,
        idAdministrador: p.pessoa.idAdministrador,
        dataCadastro: p.pessoa.dataCadastro,
        nome: p.pessoa.nome,
        cpf: p.pessoa.cpf,
        endereco: p.pessoa.endereco
      };
    } else {
        throw new Error("ERRO_AO_BUSCAR");
    };
  };

  public async listarPessoas(dto: ListarPessoasDTO): Promise<PessoaResponseDTO[]> {
    const pessoas = await this.pessoaRepo.listarPessoas(dto.idAdministrador);
    if (!pessoas) {
      throw new Error("ERRO_AO_BUSCAR");
    };

    const pessoasDTO: (PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO)[] = [];
    for (const p of pessoas) {
      if (p instanceof PessoaFisica) {
        pessoasDTO.push({
          id: p.id!,
          idAdministrador: p.idAdministrador,
          dataCadastro: p.dataCadastro,
          nome: p.nome,
          cpf: p.cpf,
          endereco: p.endereco,
        });
      } else if (p instanceof PessoaJuridica) {
        pessoasDTO.push({
          id: p.id!,
          idAdministrador: p.idAdministrador,
          dataCadastro: p.dataCadastro,
          razaoSocial: p.razaoSocial,
          cnpj: p.cnpj,
          inscrEstadual: p.inscrEstadual,
          endereco: p.endereco,
        });
      } else {
        throw new Error("ERRO_AO_BUSCAR");
      };
    }

    if (pessoas && pessoas.length === 0) {
      throw new Error("SEM_REGISTROS");
    };

    return pessoasDTO;
  };
};

export default PessoaService;
