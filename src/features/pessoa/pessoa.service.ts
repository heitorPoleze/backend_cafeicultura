import ClienteRepo from "../../shared/domain/pessoa/cliente/cliente.repository";
import FornecedorRepo from "../../shared/domain/pessoa/fornecedor/fornecedor.repository";
import FuncionarioRepo from "../../shared/domain/pessoa/funcionario/funcionario.repository";
import MeeiroRepo from "../../shared/domain/pessoa/meeiro/meeiro.repository";
import PrestadorRepo from "../../shared/domain/pessoa/prestadordeservico/prestador.repository";
import PessoaRepo from "../../shared/domain/pessoa/pessoa.repository";
import PessoaFactory from "../../shared/domain/pessoa/pessoafactory.entity";
import PessoaBase from "../../shared/domain/pessoa/pessoabase.entity";
import { cnpj as ValidarCNPJ } from "cpf-cnpj-validator";
import {
  ClienteResponseDTO,
  CreateClienteDTO,
  CreateFornecedorDTO,
  CreateFuncionarioDTO,
  CreateMeeiroDTO,
  CreatePessoaDTO,
  CreatePrestadorDTO,
  ExcluirPessoaDTO,
  FornecedorResponseDTO,
  FuncionarioResponseDTO,
  ListarPessoasDTO,
  MeeiroResponseDTO,
  PessoaFisicaResponseDTO,
  PessoaJuridicaResponseDTO,
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
import Endereco from "../../shared/domain/endereco/endereco.vo";
import { ResultadoPaginacao } from "../../shared/utils/pagination.dto";
import { TipoPapel } from "../../shared/domain/pessoa/pessoa.dto";

class PessoaService {
  constructor(
    private readonly clienteRepo: ClienteRepo,
    private readonly fornecedorRepo: FornecedorRepo,
    private readonly funcionarioRepo: FuncionarioRepo,
    private readonly meeiroRepo: MeeiroRepo,
    private readonly prestadorRepo: PrestadorRepo,
    private readonly pessoaRepo: PessoaRepo,
  ) { }

  private extrairNomeAlvo(dados: CreatePessoaDTO): string {
    return dados.tipoPessoa === "fisica" ? dados.nome! : dados.razaoSocial!;
  }

  private async validarUnicidadeDeNomePorPapel(
    nomeOuRazaoSocial: string,
    papel: TipoPapel,
    idAdministrador: number,
    ignorarPessoaId?: number
  ): Promise<void> {
    const nomeDuplicado = await this.pessoaRepo.verificarNomeDuplicadoNoPapel(
      nomeOuRazaoSocial,
      papel,
      idAdministrador,
      ignorarPessoaId
    );

    if (nomeDuplicado) {
      throw new Error(`NOME_DUPLICADO:${papel}`);
    }
  }

  private async validarDocumentosUnicosNoCadastro(dados: CreatePessoaDTO): Promise<void> {
    if (!dados.idAdministrador) {
      throw new Error("ID_ADMINISTRADOR_OBRIGATORIO");
    }

    if (dados.tipoPessoa === "fisica") {
      if (dados.cpf) {
        const cpfExistente = await this.pessoaRepo.verificarCpfExistente(dados.cpf, dados.idAdministrador);
        if (cpfExistente) throw new Error("CPF_EXISTENTE");
      }
    } else if (dados.tipoPessoa === "juridica") {
      if (dados.cnpj) {
        const cnpjExistente = await this.pessoaRepo.verificarCnpjExistente(dados.cnpj, dados.idAdministrador);
        if (cnpjExistente) throw new Error("CNPJ_EXISTENTE");
      }
      if (dados.inscrEstadual) {
        await this.verificarInscricaoEstadualExistente(dados.inscrEstadual, dados.idAdministrador);
      }
    }
  }

  private async construirPessoaBaseValidada(dados: CreatePessoaDTO, papel: TipoPapel): Promise<PessoaBase> {
    const nomeAlvo = this.extrairNomeAlvo(dados);
    await this.validarUnicidadeDeNomePorPapel(nomeAlvo, papel, dados.idAdministrador!);
    await this.validarDocumentosUnicosNoCadastro(dados);
    return PessoaFactory.criarPessoa(dados.tipoPessoa, dados);
  }

  private validarPosseDePapel<T extends { pessoa: PessoaBase }>(
    entidade: T | null,
    idUsuarioSessao: number
  ): T {
    if (!entidade) throw new Error("NAO_ENCONTRADO");
    if (entidade.pessoa.idAdministrador !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");
    return entidade;
  }

  private async buscarPessoaAutorizada(
    pessoaId: number,
    idAdministrador: number,
    erroPadrao: "ACESSO_NEGADO" | "NAO_ENCONTRADO" = "ACESSO_NEGADO"
  ): Promise<PessoaBase> {
    const pessoa = await this.pessoaRepo.buscarPorId(pessoaId);
    if (!pessoa || pessoa.idAdministrador !== idAdministrador) {
      throw new Error(erroPadrao);
    }
    return pessoa;
  }

  private mapearParaPessoaFisicaDTO(pessoa: PessoaBase): PessoaFisicaResponseDTO {
    if (!(pessoa instanceof PessoaFisica)) {
      throw new Error("ERRO_AO_BUSCAR");
    }
    return {
      id: pessoa.id!,
      idAdministrador: pessoa.idAdministrador,
      dataCadastro: pessoa.dataCadastro,
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      endereco: pessoa.endereco,
    };
  }

  private mapearParaPessoaMistaDTO(
    pessoa: PessoaBase,
    incluirPapel: boolean = false
  ): PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO {
    const camposComuns = {
      id: pessoa.id!,
      idAdministrador: pessoa.idAdministrador,
      dataCadastro: pessoa.dataCadastro,
      endereco: pessoa.endereco,
      ...(incluirPapel ? { papel: pessoa.papel } : {}),
    };

    if (pessoa instanceof PessoaFisica) {
      return {
        ...camposComuns,
        nome: pessoa.nome,
        cpf: pessoa.cpf,
      };
    }

    if (pessoa instanceof PessoaJuridica) {
      return {
        ...camposComuns,
        razaoSocial: pessoa.razaoSocial,
        cnpj: pessoa.cnpj,
        inscrEstadual: pessoa.inscrEstadual,
      };
    }

    throw new Error("ERRO_AO_BUSCAR");
  }

  public async cadastrarCliente(dto: CreateClienteDTO) {
    const pessoaBase = await this.construirPessoaBaseValidada(dto, "cliente");
    return await this.clienteRepo.salvarComTransacao(new Cliente(pessoaBase));
  }

  public async cadastrarFornecedor(dto: CreateFornecedorDTO) {
    const pessoaBase = await this.construirPessoaBaseValidada(dto, "fornecedor");
    return await this.fornecedorRepo.salvarComTransacao(new Fornecedor(pessoaBase));
  }

  public async cadastrarFuncionario(dto: CreateFuncionarioDTO) {
    const pessoaBase = await this.construirPessoaBaseValidada(dto, "funcionario");
    const funcionario = new Funcionario(pessoaBase, dto.ctps, dto.salario);
    return await this.funcionarioRepo.salvarComTransacao(funcionario);
  }

  public async cadastrarMeeiro(dto: CreateMeeiroDTO) {
    const pessoaBase = await this.construirPessoaBaseValidada(dto, "meeiro");
    return await this.meeiroRepo.salvarComTransacao(new Meeiro(pessoaBase));
  }

  public async cadastrarPrestador(dto: CreatePrestadorDTO) {
    const pessoaBase = await this.construirPessoaBaseValidada(dto, "prestadordeservico");
    return await this.prestadorRepo.salvarComTransacao(new Prestador(pessoaBase));
  }

  public async buscarClientePorId(idCliente: number, idUsuarioSessao: number): Promise<ClienteResponseDTO> {
    const cliente = this.validarPosseDePapel(await this.clienteRepo.buscarPorId(idCliente), idUsuarioSessao);
    return this.mapearParaPessoaMistaDTO(cliente.pessoa);
  }

  public async buscarFornecedorPorId(idFornecedor: number, idUsuarioSessao: number): Promise<FornecedorResponseDTO> {
    const fornecedor = this.validarPosseDePapel(await this.fornecedorRepo.buscarPorId(idFornecedor), idUsuarioSessao);
    return this.mapearParaPessoaMistaDTO(fornecedor.pessoa);
  }

  public async buscarFuncionarioPorId(idFuncionario: number, idUsuarioSessao: number): Promise<FuncionarioResponseDTO> {
    const funcionario = this.validarPosseDePapel(await this.funcionarioRepo.buscarPorId(idFuncionario), idUsuarioSessao);
    return {
      ...this.mapearParaPessoaFisicaDTO(funcionario.pessoa),
      ctps: funcionario.ctps,
      salario: funcionario.salario,
    };
  }

  public async buscarMeeiroPorId(idMeeiro: number, idUsuarioSessao: number): Promise<MeeiroResponseDTO> {
    const meeiro = this.validarPosseDePapel(await this.meeiroRepo.buscarPorId(idMeeiro), idUsuarioSessao);
    return this.mapearParaPessoaFisicaDTO(meeiro.pessoa);
  }

  public async buscarPrestadorPorId(idPrestador: number, idUsuarioSessao: number): Promise<PrestadorResponseDTO> {
    const prestador = this.validarPosseDePapel(await this.prestadorRepo.buscarPorId(idPrestador), idUsuarioSessao);
    return this.mapearParaPessoaMistaDTO(prestador.pessoa);
  }

  public async listarPessoas(
    dto: ListarPessoasDTO
  ): Promise<ResultadoPaginacao<PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO>> {
    const { data: pessoas, total, pagina, totalPaginas } = await this.pessoaRepo.listarPessoas(
      dto.idAdministrador,
      dto.pagina,
      dto.limite
    );

    if (!pessoas) throw new Error("ERRO_AO_BUSCAR");
    if (pessoas.length === 0) throw new Error("SEM_REGISTROS");

    const pessoasDTO = pessoas.map((p) => this.mapearParaPessoaMistaDTO(p, true));
    return { data: pessoasDTO, total, pagina, totalPaginas };
  }

  public async buscarFuncionariosPorIdAdministrador(
    idAdministrador: number
  ): Promise<{ dados: FuncionarioResponseDTO[] }> {
    const resultado = await this.funcionarioRepo.listarFuncionarios(idAdministrador);
    if (!resultado || !Array.isArray(resultado.dados)) return { dados: [] };

    const dados = resultado.dados.map((item) => {
      if (!(item instanceof Funcionario)) throw new Error("ERRO_AO_BUSCAR");
      return {
        ...this.mapearParaPessoaFisicaDTO(item.pessoa),
        ctps: item.ctps,
        salario: item.salario,
      };
    });

    return { dados };
  }

  public async buscarClientesPorIdAdministrador(idAdministrador: number): Promise<{ dados: ClienteResponseDTO[] }> {
    const resultado = await this.clienteRepo.buscarClientesPorAdministrador(idAdministrador);
    if (!resultado || !Array.isArray(resultado.dados)) return { dados: [] };

    return {
      dados: resultado.dados.map((c) => this.mapearParaPessoaMistaDTO(c.pessoa)),
    };
  }

  public async buscarFornecedoresPorIdAdministrador(
    idAdministrador: number
  ): Promise<{ dados: FornecedorResponseDTO[] }> {
    const resultado = await this.fornecedorRepo.buscarFornecedoresPorAdministrador(idAdministrador);
    if (!resultado || !Array.isArray(resultado.dados)) return { dados: [] };

    return {
      dados: resultado.dados.map((f) => this.mapearParaPessoaMistaDTO(f.pessoa)),
    };
  }

  public async buscarMeeirosPorIdAdministrador(idAdministrador: number): Promise<{ dados: MeeiroResponseDTO[] }> {
    const resultado = await this.meeiroRepo.buscarMeeirosPorAdministrador(idAdministrador);
    if (!resultado || !Array.isArray(resultado.dados)) return { dados: [] };

    return {
      dados: resultado.dados.map((m) => this.mapearParaPessoaMistaDTO(m.pessoa)),
    };
  }

  public async buscarPrestadoresDeServicoPorIdAdministrador(
    idAdministrador: number
  ): Promise<{ dados: PrestadorResponseDTO[] }> {
    const resultado = await this.prestadorRepo.buscarPrestadoresPorAdministrador(idAdministrador);
    if (!resultado || !Array.isArray(resultado.dados)) return { dados: [] };

    return {
      dados: resultado.dados.map((p) => this.mapearParaPessoaMistaDTO(p.pessoa)),
    };
  }

  public async atualizarFuncionarioSalario(dto: updateSalarioFuncionarioDTO, idUsuarioSessao: number) {
    const funcionario = this.validarPosseDePapel(await this.funcionarioRepo.buscarPorId(dto.id), idUsuarioSessao);
    funcionario.salario = dto.salario;

    const resultado = await this.funcionarioRepo.atualizarSalario(dto.id, funcionario.salario);
    if (!resultado) throw new Error("NAO_ATUALIZADO");
    return resultado;
  }

  public async cadastrarEnderecoPessoaGenerica(
    pessoaId: number,
    enderecoData: Endereco,
    idAdministrador: number
  ): Promise<Endereco> {
    await this.buscarPessoaAutorizada(pessoaId, idAdministrador, "NAO_ENCONTRADO");
    return await this.pessoaRepo.cadastrarEndereco(enderecoData, pessoaId);
  }

  public async atualizarEnderecoPessoaGenerica(
    pessoaId: number,
    enderecoData: Endereco,
    idAdministrador: number
  ): Promise<Endereco> {
    await this.buscarPessoaAutorizada(pessoaId, idAdministrador, "NAO_ENCONTRADO");
    return await this.pessoaRepo.atualizarEndereco(enderecoData, pessoaId);
  }

  public async removerEnderecoPessoaGenerica(pessoaId: number, idAdministrador: number) {
    await this.buscarPessoaAutorizada(pessoaId, idAdministrador, "NAO_ENCONTRADO");
    return await this.pessoaRepo.removerEndereco(pessoaId);
  }

  public async atualizarNomeOuRazaoSocial(
    dados: Record<string, unknown>,
    pessoaId: number,
    idAdministrador: number,
  ): Promise<void> {
    const pessoa = await this.pessoaRepo.buscarPorId(pessoaId);
    if (!pessoa || pessoa.idAdministrador !== idAdministrador) {
      throw new Error("ACESSO_NEGADO");
    }

    const papelAtual = pessoa.papel as TipoPapel | null;

    if (pessoa instanceof PessoaFisica) {
      const novoNome = typeof dados["nome"] === "string" ? dados["nome"].trim() : "";
      if (!novoNome || dados["razaoSocial"] !== undefined) {
        throw new Error("TIPO_DE_PESSOA_INVALIDO");
      }

      if (papelAtual) {
        await this.validarUnicidadeDeNomePorPapel(novoNome, papelAtual, idAdministrador, pessoa.id);
      }

      await this.pessoaRepo.atualizarNomePessoaFisica(pessoa.id!, novoNome, idAdministrador);
    } else if (pessoa instanceof PessoaJuridica) {
      const novaRazaoSocial =
        typeof dados["razaoSocial"] === "string" ? dados["razaoSocial"].trim() : "";
      if (!novaRazaoSocial || dados["nome"] !== undefined) {
        throw new Error("TIPO_DE_PESSOA_INVALIDO");
      }

      if (papelAtual) {
        await this.validarUnicidadeDeNomePorPapel(
          novaRazaoSocial,
          papelAtual,
          idAdministrador,
          pessoa.id,
        );
      }

      await this.pessoaRepo.atualizarRazaoSocial(pessoa.id!, novaRazaoSocial, idAdministrador);
    } else {
      throw new Error("TIPO_DE_PESSOA_INVALIDO");
    }
  }

  public async atualizarCpf(novoCpf: string, pessoaId: number, idAdministrador: number) {
    const pessoa = await this.buscarPessoaAutorizada(pessoaId, idAdministrador);
    if (!(pessoa instanceof PessoaFisica)) {
      throw new Error("TIPO_DE_PESSOA_INVALIDO");
    }

    const cpfExistente = await this.pessoaRepo.verificarCpfExistente(novoCpf, idAdministrador);
    if (cpfExistente) throw new Error("CPF_EXISTENTE");

    return await this.pessoaRepo.atualizarCpfPessoa(pessoa.id!, novoCpf);
  }

  public async atualizarCNPJ(novoCnpj: string, pessoaId: number, idAdministrador: number) {
    const pessoa = await this.buscarPessoaAutorizada(pessoaId, idAdministrador);
    if (!(pessoa instanceof PessoaJuridica)) {
      throw new Error("OPERACAO_INVALIDA");
    }

    const cnpjExistente = await this.pessoaRepo.verificarCnpjExistente(novoCnpj, idAdministrador);
    if (cnpjExistente) throw new Error("CNPJ_EXISTENTE");

    if (!ValidarCNPJ.isValid(novoCnpj, true)) {
      throw new Error("CNPJ_INVALIDO");
    }

    return await this.pessoaRepo.atualizarCnpj(novoCnpj, pessoaId);
  }

  public async atualizarInscricaoEstadual(novaIE: string, pessoaId: number, idAdministrador: number) {
    const pessoa = await this.buscarPessoaAutorizada(pessoaId, idAdministrador);
    if (!(pessoa instanceof PessoaJuridica)) {
      throw new Error("OPERACAO_INVALIDA");
    }

    await this.verificarInscricaoEstadualExistente(novaIE, idAdministrador);
    return await this.pessoaRepo.atualizarInscricaoEstadualPorPessoaId(pessoaId, novaIE);
  }

  public async verificarInscricaoEstadualExistente(ie: string, idAdministrador: number): Promise<void> {
    const ieExistente = await this.pessoaRepo.verificarInscricaoEstadualExistente(ie, idAdministrador);
    if (ieExistente) {
      throw new Error("INSCRICAO_ESTADUAL_EXISTENTE");
    }
  }

  public async excluirCliente(dto: ExcluirPessoaDTO, idUsuarioSessao: number): Promise<void> {
    const cliente = this.validarPosseDePapel(await this.clienteRepo.buscarPorId(dto.id), idUsuarioSessao);
    await this.clienteRepo.excluir(cliente);
  }

  public async excluirFornecedor(dto: ExcluirPessoaDTO, idUsuarioSessao: number): Promise<void> {
    const fornecedor = this.validarPosseDePapel(await this.fornecedorRepo.buscarPorId(dto.id), idUsuarioSessao);
    await this.fornecedorRepo.excluir(fornecedor);
  }

  public async excluirFuncionario(dto: ExcluirPessoaDTO, idUsuarioSessao: number): Promise<void> {
    const funcionario = this.validarPosseDePapel(await this.funcionarioRepo.buscarPorId(dto.id), idUsuarioSessao);
    await this.funcionarioRepo.excluir(funcionario);
  }

  public async excluirMeeiro(dto: ExcluirPessoaDTO, idUsuarioSessao: number): Promise<void> {
    const meeiro = this.validarPosseDePapel(await this.meeiroRepo.buscarPorId(dto.id), idUsuarioSessao);
    await this.meeiroRepo.excluir(meeiro);
  }

  public async excluirPrestador(dto: ExcluirPessoaDTO, idUsuarioSessao: number): Promise<void> {
    const prestador = this.validarPosseDePapel(await this.prestadorRepo.buscarPorId(dto.id), idUsuarioSessao);
    await this.prestadorRepo.excluir(prestador);
  }
}

export default PessoaService;