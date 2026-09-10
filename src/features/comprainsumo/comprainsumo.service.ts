import { Prisma, PrismaClient } from "@prisma/client";
import CompraInsumo from "./comprainsumo.entity";
import CompraInsumoRepository from "./comprainsumo.repository";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import FornecedorRepository from "../../shared/domain/pessoa/fornecedor/fornecedor.repository";
import InsumoRepository from "../../shared/domain/insumo/insumo.repository";
import { CadastrarCompraInsumoDTO, CompraInsumoDTO, ListarPorInsumoDescricaoDTO, ListarPorPropriedadeDTO, ListarPorProprietarioDTO } from "./comprainsumo.dto";
import EstoqueInsumoRepository from "../../shared/domain/estoqueinsumo/estoqueinsumo.repository";
import DespesaService from "../despesa/despesa.service";
import InsumoService from "../insumo/insumo.service";
import EstoqueInsumo from "../../shared/domain/estoqueinsumo/estoqueinsumo.entity";

class CompraInsumoService {
  constructor(
    private prisma: PrismaClient,
    private insumoService: InsumoService,
    private despesaService: DespesaService,
    private compraRepo: CompraInsumoRepository,
    private propriedadeRepo: PropriedadeRepository,
    private fornecedorRepo: FornecedorRepository,
    private insumoRepo: InsumoRepository,
    private estoqueRepo: EstoqueInsumoRepository
  ) {};

  private async verificarPropriedade(idPropriedade: number, idProprietario: number, tx: Prisma.TransactionClient): Promise<void> {
    const propriedade = await this.propriedadeRepo.buscarPorId(idPropriedade, tx);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
    if (propriedade.idProprietario !== idProprietario) throw new Error("ACESSO_NEGADO");
  };

  public async cadastrar(dto: CadastrarCompraInsumoDTO, idUsuarioSessao: number): Promise<number> {
    return await this.prisma.$transaction(async (tx) => {
      await this.verificarPropriedade(dto.idPropriedade, idUsuarioSessao, tx);

      const fornecedor = await this.fornecedorRepo.buscarPorId(dto.beneficiado, tx);
      if (!fornecedor) throw new Error("FORNECEDOR_NAO_ENCONTRADO");

      let insumoDomain;

      if (dto.idInsumo) {
        insumoDomain = await this.insumoRepo.buscarPorId(dto.idInsumo, idUsuarioSessao, tx);
        if (!insumoDomain) throw new Error("INSUMO_NAO_ENCONTRADO");
      } else if (dto.novoInsumo) {
        insumoDomain = await this.insumoService.cadastrar(dto.novoInsumo, idUsuarioSessao, tx);
      };

      if (!insumoDomain || !insumoDomain.id) throw new Error("FALHA_CADASTRO_INSUMO");

      const despesa = await this.despesaService.cadastrar(dto, idUsuarioSessao, tx);
      if (!despesa) throw new Error("FALHA_CADASTRO_DESPESA");

      const novaCompra = new CompraInsumo(undefined, insumoDomain, despesa, dto.qtdComprada);

      const idCompraGerada = await this.compraRepo.cadastrar(novaCompra, despesa.id!, tx);
      if (!idCompraGerada) throw new Error("FALHA_CADASTRO_COMPRA");

      let estoque = await this.estoqueRepo.buscarEstoque(insumoDomain.id, dto.idPropriedade, idUsuarioSessao, tx);

      if (estoque) {
        estoque.adicionar(dto.qtdComprada);
        await this.estoqueRepo.atualizar(estoque, tx);
      } else {
        estoque = new EstoqueInsumo(undefined, insumoDomain.id, dto.idPropriedade, dto.qtdComprada);
        if (!await this.estoqueRepo.cadastrar(estoque, tx)) 
          throw new Error("FALHA_CADASTRO_ESTOQUE");
      };

      return idCompraGerada;
    });
  }

  public async buscarPorId(id: number, idUsuarioSessao: number): Promise<CompraInsumoDTO> {
    return await this.prisma.$transaction(async (tx) => {
      const compra = await this.compraRepo.buscarPorId(id, tx);
      if (!compra) throw new Error("COMPRA_NAO_ENCONTRADA");
      await this.verificarPropriedade(compra.despesa.idPropriedade, idUsuarioSessao, tx);
      return compra;
    })
  }

  public async listarPorPropriedade(dto: ListarPorPropriedadeDTO, idUsuarioSessao: number): Promise<CompraInsumoDTO[]> {
    return await this.prisma.$transaction(async (tx) => {
      await this.verificarPropriedade(dto.idPropriedade, idUsuarioSessao, tx);
      const compras = await this.compraRepo.listarPorPropriedade(dto.idPropriedade, tx);
      if (!compras || compras.length === 0) throw new Error("COMPRAS_NAO_ENCONTRADAS");
      return compras;
    })
  }

  public async listarPorProprietario(dto: ListarPorProprietarioDTO): Promise<CompraInsumoDTO[]> {
    const compras = await this.compraRepo.listarPorProprietario(dto.idProprietario);
    if (!compras || compras.length === 0) throw new Error("COMPRAS_NAO_ENCONTRADAS");
    return compras;
  }

  public async listarPorInsumoDescricao(dto: ListarPorInsumoDescricaoDTO, idUsuarioSessao: number): Promise<CompraInsumoDTO[]> {
    const compras = await this.compraRepo.listarPorInsumoDescricao(dto.descricao, idUsuarioSessao);
    if (!compras || compras.length === 0) throw new Error("COMPRAS_NAO_ENCONTRADAS");
    return compras;
  }
}
export default CompraInsumoService;