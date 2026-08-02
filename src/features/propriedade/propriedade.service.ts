import PropriedadeRepository from "./propriedade.repository";
import {
  CreatePropriedadeDTO,
  UpdateNomePropriedadeDTO,
  UpdateEnderecoPropriedadeDTO,
  UpdateTamanhoPropriedadeDTO,
  PropriedadeResponseDTO,
  ListPropriedadesDTO,
  ExcluirPropriedadeDTO,
} from "./propriedade.dto";
import Propriedade from "./propriedade.entity";
import Tamanho from "../../shared/domain/tamanho/tamanho.entity";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import { Prisma, PrismaClient } from "@prisma/client";
import TalhaoRepository from "../talhao/talhao.repository";

class PropriedadeService {
  constructor(private prisma: PrismaClient, private repo: PropriedadeRepository, private talhaoRepo: TalhaoRepository) {}

  public async cadastrar(
    dto: CreatePropriedadeDTO,
    idUsuarioSessao: number,
  ): Promise<number> {
    const tamanho = new Tamanho(dto.tamanho.valor, dto.tamanho.medida);
    const endereco = new Endereco(
      dto.endereco.cidade,
      dto.endereco.bairro,
      dto.endereco.cep,
      dto.endereco.uf,
      dto.endereco.pais,
      dto.endereco.logradouro,
      undefined,
    );

    const propriedade = new Propriedade(
      dto.nome,
      idUsuarioSessao,
      tamanho,
      endereco,
    );
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (await this.repo.verificarNome(propriedade, tx)) {
        throw new Error("NOME_DUPLICADO");
      };
      return await this.repo.salvar(propriedade, tx);
    })
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
    const talhoesExistentes = await this.talhaoRepo.buscarAbertosPorPropriedade(idPropriedade);

    const novoTamanho = new Tamanho(dto.tamanho.valor, dto.tamanho.medida, propriedade.tamanho.id);
    const areaNovaPropriedadeM2 = this.calcularAreaEmM2(novoTamanho);
    
    let areaUtilizadaM2 = 0;
    for (const t of talhoesExistentes) {
      areaUtilizadaM2 += this.calcularAreaEmM2(t.tamanho);
    };
    areaUtilizadaM2 = Math.round(areaUtilizadaM2);

    if (areaNovaPropriedadeM2 < areaUtilizadaM2) {
      const disponivelHectares = areaUtilizadaM2 / 10000;
      const formatador = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4, minimumFractionDigits: 0 });
      throw new Error(
        `O novo tamanho da propriedade não pode ser menor que ${formatador.format(areaUtilizadaM2)} m² ` +
        `(ou ${formatador.format(disponivelHectares)} hectares). Você deve finalizar um talhão ou diminuir a área de um talhão aberto.`
      );
    };

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
      dto.endereco.cidade,
      dto.endereco.bairro,
      dto.endereco.cep,
      dto.endereco.uf,
      dto.endereco.pais,
      dto.endereco.logradouro,
      propriedade.endereco.idEndereco,
    );

    propriedade.endereco = novoEnd;
    await this.repo.atualizarEndereco(
      propriedade.endereco.idEndereco!,
      propriedade.endereco,
    );
  };

  public async listarPorProprietario(
    dto: ListPropriedadesDTO,
  ): Promise<PropriedadeResponseDTO[]> {
    const propriedades = await this.repo.listarPorProprietario(dto.idProprietario);
    if (!propriedades) {
      throw new Error("NAO_ENCONTRADA");
    };
    return propriedades
  };

  public async excluir(
    dto: ExcluirPropriedadeDTO,
    idUsuarioSessao: number,
  ): Promise<void> {
    const propriedade = await this.buscarPorId(dto.id, idUsuarioSessao);
    await this.repo.excluir(propriedade.id!);
  };

  private calcularAreaEmM2(tamanho: Tamanho): number {
    if (tamanho.medida === "hectare") {
      return tamanho.valor * 10000;
    };
    return tamanho.valor;
  };

};

export default PropriedadeService;