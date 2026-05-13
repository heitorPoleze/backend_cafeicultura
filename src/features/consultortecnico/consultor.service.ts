import ConsultorTecnicoRepository from "./consultor.repository";
import PessoaFisica from "../../shared/domain/pessoafisica.entity";
import ConsultorTecnico from "./consultor.entity";
import Credencial from "../auth/auth.entity";
import { CreateConsultorDTO } from "./consultor.dto";

class ConsultorTecnicoService {
  constructor(private repo: ConsultorTecnicoRepository) {}

  public async cadastrar(dto: CreateConsultorDTO): Promise<number> {
    // 1. Instancia e prepara a Credencial (Isolada)
    const credencial = new Credencial(dto.email, dto.telefone, dto.senha);
    await credencial.criptografarSenha(); // Faz o hash da senha agora

    // 2. Instancia o Modelo Rico do Domínio
    // Se o CPF for inválido, a PessoaFisica lançará o erro e o processo para aqui.
    const perfil = new PessoaFisica(dto.nome, dto.cpf);
    const consultor = new ConsultorTecnico(undefined, perfil); // Ainda não tem ID do banco

    // 3. Passa tudo para o Repositório salvar em uma transação atômica
    const novoId = await this.repo.salvarComTransacao(consultor, credencial);

    return novoId;
  }
}

export default ConsultorTecnicoService;
