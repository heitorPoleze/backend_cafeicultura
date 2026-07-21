import Insumo, { MedidaInsumo } from '../../shared/domain/insumo/insumo.entity';
import InsumoRepository from '../../shared/domain/insumo/insumo.repository';
import { BuscarInsumoPorDescricaoDTO, BuscarInsumoPorIdDTO, CadastrarInsumoDTO, InsumoResponseDTO } from './insumo.dto';

class InsumoService {
    constructor(private readonly insumoRepo: InsumoRepository) {}

    public async cadastrar(dto: CadastrarInsumoDTO, idUsuario: number): Promise<number> {
        if (await this.insumoRepo.verificarExistente(dto.descricao, idUsuario)) 
            throw new Error('INSUMO_EXISTENTE');

        if (!Object.values(MedidaInsumo).includes(dto.medida)) 
            throw new Error('MEDIDA_INVALIDA');
        
        if (dto.idProprietario !== idUsuario) 
            throw new Error('PROPRIETARIO_INVALIDO');
        
        const descricaoPadronizada = dto.descricao
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        const novoInsumo = new Insumo(undefined, dto.idProprietario, descricaoPadronizada, dto.medida);
        return await this.insumoRepo.cadastrar(novoInsumo);
    };

    public async buscarPorId(dto: BuscarInsumoPorIdDTO, idUsuario: number): Promise<InsumoResponseDTO> {
        const insumo = await this.insumoRepo.buscarPorId(dto.id, idUsuario);
        if (!insumo) throw new Error('INSUMO_NAO_ENCONTRADO');
        return insumo;
    };

    public async buscarPorDescricao(dto: BuscarInsumoPorDescricaoDTO, idUsuario: number): Promise<InsumoResponseDTO> {
        const insumo = await this.insumoRepo.buscarPorDescricao(dto.descricao, idUsuario);
        if (!insumo) throw new Error('INSUMO_NAO_ENCONTRADO');
        return insumo;
    };

    public async listarTodos(idUsuario: number): Promise<InsumoResponseDTO[]> {
        const insumos = await this.insumoRepo.buscarTodos(idUsuario);
        if (insumos.length === 0) throw new Error('SEM_INSUMOS');
        return insumos;
    };
}

export default InsumoService;