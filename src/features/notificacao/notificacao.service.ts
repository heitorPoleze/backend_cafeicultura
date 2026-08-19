import NotificacaoRepository from "./notificacao.repository";
import { ListarPorPropriedadeDTO, ListarPorProprietarioDTO, MarcarComoLidaDTO, NotificacaoResponseDTO } from "./notificacao.dto";

class NotificacaoService {
  constructor(private readonly notificacaoRepo: NotificacaoRepository) {}

  public async listarTodas(dto: ListarPorProprietarioDTO): Promise<NotificacaoResponseDTO[]> {
    return await this.notificacaoRepo.listarTodas(dto.idProprietario);
  }

  public async listarTodasPropriedade(dto: ListarPorPropriedadeDTO): Promise<NotificacaoResponseDTO[]> {
    return await this.notificacaoRepo.listarTodasPropriedade(dto.idProprietario, dto.idPropriedade);
  }

  public async listarNaoLidas(dto: ListarPorProprietarioDTO): Promise<NotificacaoResponseDTO[]> {
    return await this.notificacaoRepo.listarNaoLidas(dto.idProprietario);;
  }

  public async listarNaoLidasPropriedade(dto: ListarPorPropriedadeDTO): Promise<NotificacaoResponseDTO[]> {
    return await this.notificacaoRepo.listarNaoLidasPropriedade(dto.idProprietario, dto.idPropriedade);;
  }

  public async marcarComoLida(dto: MarcarComoLidaDTO): Promise<void> {
    await this.notificacaoRepo.marcarComoLida(dto.idNotificacao, dto.idProprietario);
  }
}

export default NotificacaoService;