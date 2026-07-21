import { PrismaClient } from "@prisma/client";
import CompraInsumo from "./comprainsumo.entity";
import Despesa from "../despesa/despesa.entity";
import CompraInsumoRepository from "./comprainsumo.repository";
import DespesaRepository from "../despesa/despesa.repository";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import FornecedorRepository from "../../shared/domain/pessoa/fornecedor/fornecedor.repository";
import InsumoRepository from "../../shared/domain/insumo/insumo.repository";
import { CadastrarCompraInsumoDTO, ListarPorInsumoDescricaoDTO, ListarPorPropriedadeDTO, ListarPorProprietarioDTO } from "./comprainsumo.dto";

class CompraInsumoService {
  constructor(
    private prisma: PrismaClient,
    private compraRepo: CompraInsumoRepository,
    private despesaRepo: DespesaRepository,
    private propriedadeRepo: PropriedadeRepository,
    private fornecedorRepo: FornecedorRepository,
    private insumoRepo: InsumoRepository
  ) {}

  public async cadastrar(dto: CadastrarCompraInsumoDTO, idUsuarioSessao: number): Promise<number> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const fornecedor = await this.fornecedorRepo.buscarPorId(dto.beneficiado);
    if (!fornecedor) throw new Error("FORNECEDOR_NAO_ENCONTRADO");

    const insumoDomain = await this.insumoRepo.buscarPorId(dto.idInsumo, idUsuarioSessao);
    if (!insumoDomain) throw new Error("INSUMO_NAO_ENCONTRADO");

    const novaDespesa = new Despesa(
      undefined,
      dto.idEvento,
      dto.idPropriedade,
      new Date(),
      dto.valor,
      dto.formaPagamento,
      dto.tipoOperacao,
      fornecedor.pessoa,
      dto.descricao
    );

    const novaCompra = new CompraInsumo(undefined, insumoDomain, novaDespesa, dto.qtdComprada);

    return await this.prisma.$transaction(async (tx) => {
      const idDespesaGerada = await this.despesaRepo.cadastrar(novaDespesa, tx);
      return await this.compraRepo.cadastrar(novaCompra, idDespesaGerada, tx);
    });
  }

  public async buscarPorId(id: number, idUsuarioSessao: number): Promise<CompraInsumo> {
    const compra = await this.compraRepo.buscarPorId(id);
    if (!compra) throw new Error("COMPRA_NAO_ENCONTRADA");

    const propriedade = await this.propriedadeRepo.buscarPorId(compra.despesa.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    return compra;
  }

  public async listarPorPropriedade(dto: ListarPorPropriedadeDTO, idUsuarioSessao: number): Promise<CompraInsumo[]> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const compras = await this.compraRepo.listarPorPropriedade(dto.idPropriedade);
    if (!compras || compras.length === 0) throw new Error("COMPRAS_NAO_ENCONTRADAS");

    return compras;
  }

  public async listarPorProprietario(dto: ListarPorProprietarioDTO): Promise<CompraInsumo[]> {
    const compras = await this.compraRepo.listarPorProprietario(dto.idProprietario);
    if (!compras || compras.length === 0) throw new Error("COMPRAS_NAO_ENCONTRADAS");
    return compras;
  }

  public async listarPorInsumoDescricao(dto: ListarPorInsumoDescricaoDTO, idUsuarioSessao: number): Promise<CompraInsumo[]> {
    const compras = await this.compraRepo.listarPorInsumoDescricao(dto.descricao, idUsuarioSessao);
    if (!compras || compras.length === 0) throw new Error("COMPRAS_NAO_ENCONTRADAS");

    return compras;
  }
}   

export default CompraInsumoService;