// import { PrismaClient, Prisma } from "@prisma/client";
// import ConsultorTecnico from "./consultor.entity";
// import Credencial from "../auth/auth.entity";

// class ConsultorTecnicoRepository {
//   constructor(private prisma: PrismaClient) {}

//   public async salvarComTransacao(consultor: ConsultorTecnico, credencial: Credencial): Promise<number> {
//     return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
//       const pessoa = await tx.pessoas.create({
//         data: { dataCadastro: consultor.perfil.dataCadastro }
//       });
//       const idPessoa = pessoa.idPessoa_PK;

//       await tx.pessoasfisicas.create({
//         data: {
//           idPeFisica_PFK: idPessoa,
//           nome: consultor.perfil.nomeExibicao,
//           cpf: consultor.perfil.documento
//         }
//       });

//       await tx.consultorestecnicos.create({
//         data: { idConsultor_PFK: idPessoa }
//       });

//       await tx.usuarios.create({
//         data: {
//           idUsuario_PFK: idPessoa,
//           email: credencial.email,
//           telefone: credencial.telefone,
//           senha: credencial.senha
//         }
//       });

//       return idPessoa;
//     });
//   }
// }

// export default ConsultorTecnicoRepository;