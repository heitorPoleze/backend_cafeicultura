import PropriedadeRepository from "./propriedade.repository";
import {
  CreatePropriedadeDTO,
  UpdateNomePropriedadeDTO,
  UpdateEnderecoPropriedadeDTO,
  UpdateTamanhoPropriedadeDTO,
  PropriedadeResponseDTO,
} from "./propriedade.dto";
import Propriedade from "./propriedade.entity";
import Tamanho from "../../shared/domain/tamanho/tamanho.entity";
import Endereco from "../../shared/domain/endereco/endereco.vo";

class PropriedadeService {
  constructor(private repo: PropriedadeRepository) {}

  public async cadastrar(
    dto: CreatePropriedadeDTO,
    idUsuarioSessao: number,
  ): Promise<number> {
    const tamanho = new Tamanho(dto.tamanho.valor, dto.tamanho.medida);
    const endereco = new Endereco(
      dto.endereco.logradouro,
      dto.endereco.bairro,
      dto.endereco.cidade,
      dto.endereco.uf,
      dto.endereco.pais,
      dto.endereco.cep,
      undefined,
    );

    const propriedade = new Propriedade(
      dto.nome,
      idUsuarioSessao,
      tamanho,
      endereco,
    );
    return await this.repo.salvar(propriedade);
  };

  public async buscarPorId(
    idPropriedade: number,
    idUsuarioSessao: number,
  ): Promise<PropriedadeResponseDTO> {
    const propriedade = await this.repo.buscarPorId(idPropriedade);

    if (!propriedade) {
      throw new Error("NAO_ENCONTRADA");
    };

    if (propriedade.idProprietario !== idUsuarioSessao) {
      throw new Error("ACESSO_NEGADO");
    };

    return propriedade;
  };

  public async atualizarNome(
    idPropriedade: number,
    dto: UpdateNomePropriedadeDTO,
    idUsuarioSessao: number,
  ): Promise<void> {
    const propriedade = await this.buscarPorId(idPropriedade, idUsuarioSessao);

    propriedade.nome = dto.nome;
    await this.repo.atualizarNome(propriedade.id!, propriedade.nome);
  };

  public async atualizarTamanho(
    idPropriedade: number,
    dto: UpdateTamanhoPropriedadeDTO,
    idUsuarioSessao: number,
  ): Promise<void> {
    const propriedade = await this.buscarPorId(idPropriedade, idUsuarioSessao);

    const novoTamanho = new Tamanho(
      dto.tamanho.valor,
      dto.tamanho.medida,
      propriedade.tamanho.id,
    );

    propriedade.tamanho = novoTamanho;
    await this.repo.atualizarTamanho(
      propriedade.tamanho.id!,
      propriedade.tamanho,
    );
  };

  public async atualizarEndereco(
    idPropriedade: number,
    dto: UpdateEnderecoPropriedadeDTO,
    idUsuarioSessao: number,
  ): Promise<void> {
    const propriedade = await this.buscarPorId(idPropriedade, idUsuarioSessao);

    const novoEnd = new Endereco(
      dto.endereco.logradouro,
      dto.endereco.bairro,
      dto.endereco.cidade,
      dto.endereco.uf,
      dto.endereco.pais,
      dto.endereco.cep,
      propriedade.endereco.idEndereco,
    );

    propriedade.endereco = novoEnd;
    await this.repo.atualizarEndereco(
      propriedade.endereco.idEndereco!,
      propriedade.endereco,
    );
  };
};

export default PropriedadeService;