import DespesaRepository from "./despesa.repository";
import Despesa from "./despesa.entity";
import { BuscarDespesaDTO, CriarDespesaDTO, ExcluirDespesaDTO, ListarDespesasPropriedadeDTO, ListarDespesasProprietarioDTO, RespostaDespesaDTO } from "./despesa.dto";
import PropriedadeRepository from "../propriedade/propriedade.repository";
import PessoaRepository from "../../shared/domain/pessoa/pessoa.repository";

class DespesaService {
  constructor(
    private readonly repo: DespesaRepository,
    private readonly propriedadeRepo: PropriedadeRepository,
    private readonly pessoaRepo: PessoaRepository,
  ) {};

  public async cadastrar(dto: CriarDespesaDTO, idUsuarioSessao: number): Promise<number> {
    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
  
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    const pessoa = await this.pessoaRepo.buscarPorId(dto.beneficiado);
    if (!pessoa) throw new Error("PESSOA_NAO_ENCONTRADA");
  
    const despesa = new Despesa(undefined, dto.idEvento, dto.idPropriedade, new Date(), dto.valor, dto.formaPagamento, dto.tipoOperacao, pessoa, dto.descricao);

    return await this.repo.cadastrar(despesa);
  };

  public async buscarPorId(dto: BuscarDespesaDTO, idUsuarioSessao: number): Promise<RespostaDespesaDTO> {
    const despesa = await this.repo.buscarPorId(dto.id);
    if (!despesa) throw new Error("DESPESA_NAO_ENCONTRADA");

    const propriedade = await this.propriedadeRepo.buscarPorId(despesa.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
  
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    return despesa;
  };

  public async listarPorPropriedade(dto: ListarDespesasPropriedadeDTO, idUsuarioSessao: number): Promise<RespostaDespesaDTO[]> {
    const despesas = await this.repo.listarDespesasPropriedade(dto.idPropriedade);
    if (!despesas || despesas.length === 0) throw new Error("DESPESAS_NAO_ENCONTRADAS");

    const propriedade = await this.propriedadeRepo.buscarPorId(dto.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
  
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");
    return despesas;
  };

  public async listarPorProprietario(dto: ListarDespesasProprietarioDTO): Promise<RespostaDespesaDTO[]> {
    const despesas = await this.repo.listarDespesasProprietario(dto.idProprietario);
    if (!despesas || despesas.length === 0) throw new Error("DESPESAS_NAO_ENCONTRADAS");
    return despesas;
  };

  public async excluir(dto: ExcluirDespesaDTO, idUsuarioSessao: number): Promise<void> {
    const despesa = await this.repo.buscarPorId(dto.id);
    if (!despesa) throw new Error("DESPESA_NAO_ENCONTRADA");

    const propriedade = await this.propriedadeRepo.buscarPorId(despesa.idPropriedade);
    if (!propriedade) throw new Error("PROPRIEDADE_NAO_ENCONTRADA");
  
    if (propriedade.idProprietario !== idUsuarioSessao) throw new Error("ACESSO_NEGADO");

    await this.repo.excluir(dto.id);
  };
}

export default DespesaService;