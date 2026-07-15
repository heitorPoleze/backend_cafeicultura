import Safra from "./safra.entity";
import SafraRepository from "./safra.repository";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import {
  CadastrarSafraDTO,
  SafraRespostaDTO,
  ExcluirSafraDTO,
  FinalizarSafraDTO,
} from "./safra.dto";

export class SafraService {
  constructor(
    private readonly safraRepository: SafraRepository,
    private readonly propriedadeRepo: PropriedadeRepository
  ) {}

  public async cadastrar(dto: CadastrarSafraDTO, idUsuarioSessao: number): Promise<number> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    };
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };

    const totalAtivas = await this.safraRepository.contarSafrasAtivas(
      dto.idPropriedade,
    );
    if (totalAtivas >= 2) {
      throw new Error("DUAS_ATIVAS");
    };

    const novaSafra = new Safra({
      id: undefined,
      idPropriedade: dto.idPropriedade,
      dataInicio: dto.dataInicio,
    });

    return await this.safraRepository.cadastrar(novaSafra);
  };

  public async buscarPorId(id: number, idUsuarioSessao: number): Promise<SafraRespostaDTO> {
    const safra = await this.safraRepository.buscarPorId(id);
    if (!safra) {
      throw new Error("NAO_ENCONTRADA");
    };
    const propriedade = await this.propriedadeRepo.buscarPorId(safra.idPropriedade);
    if (!propriedade) {
      throw new Error('PROPRIEDADE_NAO_ENCONTRADA');
    };
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };
    return safra.toJSON();
  };

  public async finalizar(dto: FinalizarSafraDTO, idUsuarioSessao: number): Promise<void> {
    const safra = await this.safraRepository.buscarPorId(dto.id);
    if (!safra) {
      throw new Error("NAO_ENCONTRADA");
    };
    const propriedade = await this.propriedadeRepo.buscarPorId(safra.idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    };
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };
    safra.finalizar(dto.dataFim);
    await this.safraRepository.finalizar(safra);
  }

  public async excluir(dto: ExcluirSafraDTO, idUsuarioSessao: number): Promise<void> {
    const safra = await this.safraRepository.buscarPorId(dto.id);
    if (!safra) {
      throw new Error("NAO_ENCONTRADA");
    };
    const propriedade = await this.propriedadeRepo.buscarPorId(safra.idPropriedade);
    if (!propriedade) {
      throw new Error('NAO_ENCONTRADA');
    };
    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error('ACESSO_NEGADO');
    };
    safra.arquivar();
    await this.safraRepository.arquivar(safra);
  };
};

export default SafraService;