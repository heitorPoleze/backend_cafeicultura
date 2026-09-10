import { Prisma, PrismaClient } from '@prisma/client';
import Insumo, { MedidaInsumo } from '../../shared/domain/insumo/insumo.entity';
import InsumoRepository from '../../shared/domain/insumo/insumo.repository';
import { BuscarInsumoPorDescricaoDTO, BuscarInsumoPorIdDTO, BuscarTodosInsumosDTO, CadastrarInsumoDTO, InsumoResponseDTO } from './insumo.dto';
import EstoqueInsumoRepository from '../../shared/domain/estoqueinsumo/estoqueinsumo.repository';
import Formatador from '../../shared/utils/Formatador';

class InsumoService {
    constructor(private prisma: PrismaClient, private readonly insumoRepo: InsumoRepository, private readonly estoqueRepo: EstoqueInsumoRepository) { }

    private async verificarExistente(descricao: string, idProprietario: number, tx: Prisma.TransactionClient): Promise<boolean> {
        const insumos = await this.insumoRepo.buscarTodos(idProprietario, tx);
        return insumos.some(insumo => Formatador.normalizarNome(insumo.descricao) === Formatador.normalizarNome(descricao));
    };

    public async cadastrar(dto: CadastrarInsumoDTO, idUsuario: number, tx: Prisma.TransactionClient): Promise<Insumo> {
        if (await this.verificarExistente(dto.descricao, idUsuario, tx))
            throw new Error('INSUMO_EXISTENTE');

        if (!Object.values(MedidaInsumo).includes(dto.medida))
            throw new Error('MEDIDA_INVALIDA');

        const descricaoPadronizada = dto.descricao
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        const novoInsumo = new Insumo(undefined, idUsuario, descricaoPadronizada, dto.medida);
        return await this.insumoRepo.cadastrar(novoInsumo, tx);
    };

    public async buscarPorId(dto: BuscarInsumoPorIdDTO, idUsuario: number): Promise<InsumoResponseDTO> {
        return await this.prisma.$transaction(async (tx) => {
            const insumo = await this.insumoRepo.buscarPorId(dto.id, idUsuario, tx);
            if (!insumo) throw new Error('INSUMO_NAO_ENCONTRADO');

            const estoque = await this.estoqueRepo.buscarEstoque(insumo.id!, dto.idPropriedade, idUsuario, tx);
            if (!estoque) throw new Error('ESTOQUE_NAO_ENCONTRADO');

            return {
                id: insumo.id,
                descricao: insumo.descricao,
                medida: insumo.medida,
                qtdEstoque: estoque.quantidade
            };
        })
    };

    public async buscarPorDescricao(dto: BuscarInsumoPorDescricaoDTO, idUsuario: number): Promise<InsumoResponseDTO> {
        return await this.prisma.$transaction(async (tx) => {
            const insumo = await this.insumoRepo.buscarPorDescricao(dto.descricao, idUsuario, tx);
            if (!insumo) throw new Error('INSUMO_NAO_ENCONTRADO');

            const estoque = await this.estoqueRepo.buscarEstoque(insumo.id!, dto.idPropriedade, idUsuario, tx);
            if (!estoque) throw new Error('ACESSO_NEGADO');

            return {
                id: insumo.id,
                descricao: insumo.descricao,
                medida: insumo.medida,
                qtdEstoque: estoque.quantidade
            };
        })
    };

    public async listarTodos(dto: BuscarTodosInsumosDTO, idUsuario: number): Promise<InsumoResponseDTO[]> {
        return await this.prisma.$transaction(async (tx) => {
            const insumos = await this.insumoRepo.buscarTodos(idUsuario, tx);
            if (!insumos || insumos.length === 0) throw new Error('SEM_INSUMOS');
            const insumosComEstoque = await Promise.all(
                insumos.map(
                    async (insumo) => {
                    const estoque = await this.estoqueRepo.buscarEstoque(insumo.id!, dto.idPropriedade, idUsuario, tx);
                    if (!estoque) 
                        throw new Error('ACESSO_NEGADO');
                    return {
                        id: insumo.id,
                        descricao: insumo.descricao,
                        medida: insumo.medida,
                        qtdEstoque: estoque.quantidade
                    };
                })
            );
            return insumosComEstoque.filter((insumo) => insumo !== null);
        })
    };
}

export default InsumoService;