// import ConsultorTecnicoRepository from "./consultor.repository";
// import PessoaFisica from "../../shared/domain/pessoa/pessoafisica.entity";
// import ConsultorTecnico from "./consultor.entity";
// import Credencial from "../auth/auth.entity";
// import { CreateConsultorDTO } from "./consultor.dto";

// class ConsultorTecnicoService {
//   constructor(private repo: ConsultorTecnicoRepository) {}
//   public async cadastrar(dto: CreateConsultorDTO): Promise<number> {
//     const credencial = new Credencial(dto.email, dto.telefone, dto.senha);
//     await credencial.criptografarSenha(); // Faz o hash da senha 
//     const perfil = new PessoaFisica(dto.nome, dto.cpf);
//     const consultor = new ConsultorTecnico(
//       undefined, 
//       perfil, 
//       dto.email, 
//       dto.telefone, 
//       credencial.senha
//     ); 
//     const novoId = await this.repo.salvarComTransacao(consultor, credencial);
//     return novoId;
//   }
// }

// export default ConsultorTecnicoService;
