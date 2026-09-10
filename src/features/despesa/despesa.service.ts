import DespesaRepository from "./despesa.repository";
import Despesa from "./despesa.entity";
import { BuscarDespesaDTO, CriarDespesaDTO, ExcluirDespesaDTO, ListarDespesasPropriedadeDTO, ListarDespesasProprietarioDTO, RespostaDespesaDTO } from "./despesa.dto";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";
import { Prisma, PrismaClient } from "@prisma/client";
import PessoaBase from "../../shared/domain/pessoa/pessoabase.entity";

class DespesaService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly repo: DespesaRepository,
    private readonly propriedadeRepo: PropriedadeRepository,
    private readonly pessoaRepo: PessoaRepository,
  ) { };

  private async buscarDespesa(id: number, tx: Prisma.TransactionClient): Promise<Despesa> {
    const despesa = await this.repo.buscarPorId(id, tx);
    if (!despesa) throw new Error("DESPESA_NAO_ENCONTRADA");
    return despesa;
  }

  private async verificarPropriedade(idPropriedade: number, idProprietario: number, tx: Prisma.TransactionClient): Promise<void> {
    const propriedade = await this.propriedadeRepo.buscarPorId(idPropriedade, tx);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idProprietario) throw new Error("ACESSO_NEGADO");
  };

  
  public async cadastrar(dto: CriarDespesaDTO, idUsuarioSessao: number, tx: Prisma.TransactionClient): Promise<Despesa>;
  public async cadastrar(dto: CriarDespesaDTO, idUsuarioSessao: number): Promise<number>;
  public async cadastrar(dto: CriarDespesaDTO, idUsuarioSessao: number, tx?: Prisma.TransactionClient): Promise<number | Despesa> {
    const cadastrarDespesa = async (tx: Prisma.TransactionClient, compraInsumo: boolean = false) => {
      const pessoa = await this.pessoaRepo.buscarPorId(dto.beneficiado, tx);
      if (!pessoa) throw new Error("PESSOA_NAO_ENCONTRADA");
      const despesa = new Despesa(undefined, dto.idEvento, dto.idPropriedade, new Date(), dto.valor, dto.formaPagamento, dto.tipoOperacao, pessoa, dto.descricao);
      return await this.repo.cadastrar(despesa, tx, compraInsumo);
    };

    if (tx) {
      return await cadastrarDespesa(tx, true);
    } else {
      return await this.prisma.$transaction(async (tx) => {
        await this.verificarPropriedade(dto.idPropriedade, idUsuarioSessao, tx);
        return await cadastrarDespesa(tx);
      });
    }
  };

  public async buscarPorId(dto: BuscarDespesaDTO, idUsuarioSessao: number): Promise<RespostaDespesaDTO> {
    return await this.prisma.$transaction(async (tx) => {
      const despesa = await this.buscarDespesa(dto.id, tx);
      await this.verificarPropriedade(despesa.idPropriedade, idUsuarioSessao, tx);
      return despesa;
    })
  };

  public async listarPorPropriedade(dto: ListarDespesasPropriedadeDTO, idUsuarioSessao: number): Promise<RespostaDespesaDTO[]> {
    return await this.prisma.$transaction(async (tx) => {
      const despesas = await this.repo.listarDespesasPropriedade(dto.idPropriedade);
      if (!despesas || despesas.length === 0) throw new Error("DESPESAS_NAO_ENCONTRADAS");
      await this.verificarPropriedade(dto.idPropriedade, idUsuarioSessao, tx);
      return despesas;
    })
  };

  public async listarPorProprietario(dto: ListarDespesasProprietarioDTO): Promise<RespostaDespesaDTO[]> {
    const despesas = await this.repo.listarDespesasProprietario(dto.idProprietario);
    if (!despesas || despesas.length === 0) throw new Error("DESPESAS_NAO_ENCONTRADAS");
    return despesas;
  };

  public async excluir(dto: ExcluirDespesaDTO, idUsuarioSessao: number): Promise<void> {
    const despesa = await this.buscarDespesa(dto.id, this.prisma);
    await this.verificarPropriedade(despesa.idPropriedade, idUsuarioSessao, this.prisma);
    await this.repo.excluir(dto.id);
  };
}

export default DespesaService;