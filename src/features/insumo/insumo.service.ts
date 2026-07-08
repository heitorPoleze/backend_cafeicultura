import Insumo, { MedidaInsumo } from '../../shared/domain/insumo/insumo.entity';
import InsumoRepository from '../../shared/domain/insumo/insumo.repository';
import { BuscarInsumoPorDescricaoDTO, BuscarInsumoPorIdDTO, CadastrarInsumoDTO } from './insumo.dto';

class InsumoService {
    constructor(private readonly insumoRepo: InsumoRepository) {}

    public async cadastrar(dto: CadastrarInsumoDTO): Promise<number> {
        if (await this.insumoRepo.verificarExistente(dto.descricao)) 
            throw new Error('INSUMO_EXISTENTE');

        if (!Object.values(MedidaInsumo).includes(dto.medida)) 
            throw new Error('MEDIDA_INVALIDA');
        
        const descricaoPadronizada = dto.descricao
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        const novoInsumo = new Insumo(undefined, descricaoPadronizada, dto.medida);
        return await this.insumoRepo.cadastrar(novoInsumo);
    };

    public async buscarPorId(dto: BuscarInsumoPorIdDTO): Promise<Insumo> {
        const insumo = await this.insumoRepo.buscarPorId(dto.id);
        if (!insumo) throw new Error('INSUMO_NAO_ENCONTRADO');
        return insumo;
    };

    public async buscarPorDescricao(dto: BuscarInsumoPorDescricaoDTO): Promise<Insumo> {
        const insumo = await this.insumoRepo.buscarPorDescricao(dto.descricao);
        if (!insumo) throw new Error('INSUMO_NAO_ENCONTRADO');
        return insumo;
    };

    public async listarTodos(): Promise<Insumo[]> {
        const insumos = await this.insumoRepo.buscarTodos();
        if (insumos.length === 0) throw new Error('SEM_INSUMOS');
        return insumos;
    };
}

export default InsumoService;