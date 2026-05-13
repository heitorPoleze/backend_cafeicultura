import ProprietarioRepository from "./proprietario.repository";
import { CreateProprietarioDTO, ProprietarioResponseDTO } from "./proprietario.dto";
import Credencial from "../auth/auth.entity";
import PessoaFisica from "../../shared/domain/pessoafisica.entity";
import PessoaJuridica from "../../shared/domain/pessoajuridica.entity";
import Proprietario from "./proprietario.entity";

class ProprietarioService {
  constructor(private repo: ProprietarioRepository) {}

  public async cadastrar(dto: CreateProprietarioDTO): Promise<number> {
    const credencial = new Credencial(dto.email, dto.telefone, dto.senha);
    await credencial.criptografarSenha();

    const perfil = dto.tipoPessoa === "fisica"
      ? new PessoaFisica(dto.nome!, dto.cpf!)
      : new PessoaJuridica(dto.razaoSocial!, dto.cnpj!, dto.inscrEstadual);

    const proprietario = new Proprietario(undefined, perfil);
    return await this.repo.salvarComTransacao(proprietario, credencial);
  };

  public async buscarPorId(id: number): Promise<ProprietarioResponseDTO> {
    const res = await this.repo.buscarPorId(id);
    if (!res) throw new Error("Proprietário não encontrado.");
    return res.prop.toDTO(res.email, res.telefone);
  };
}

export default ProprietarioService;