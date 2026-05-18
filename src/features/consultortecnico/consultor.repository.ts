import { Pool, ResultSetHeader } from "mysql2/promise";
import ConsultorTecnico from "./consultor.entity";
import Credencial from "../auth/auth.entity";
import AuthRepository from "../auth/auth.repository";

class ConsultorTecnicoRepository {
  constructor(
    private db: Pool,
    private authRepo: AuthRepository // Injetamos o repo de Auth para usar seu método de insert
  ) {}

  public async salvarComTransacao(consultor: ConsultorTecnico, credencial: Credencial): Promise<number> {
    const conn = await this.db.getConnection();
    
    try {
      await conn.beginTransaction();

      // 1. Salva na tabela base e pega o ID gerado
      const [resPessoa] = await conn.execute<ResultSetHeader>(
        `INSERT INTO pessoas (dataCadastro) VALUES (?);`,
        [consultor.perfil.dataCadastro]
      );
      const idPessoa = resPessoa.insertId;

      // 2. Salva na tabela de Pessoa Física
      await conn.execute(
        `INSERT INTO pessoasfisicas (idPeFisica_PFK, nome, cpf) VALUES (?, ?, ?);`,
        [idPessoa, consultor.perfil.nomeExibicao, consultor.perfil.documento]
      );

      // 3. Salva na tabela de Consultores
      await conn.execute(
        `INSERT INTO consultoresTecnicos (idConsultor_PFK) VALUES (?);`,
        [idPessoa]
      );

      // 4. Delega o salvamento da credencial para o AuthRepo, passando a NOSSA conexão!
      await this.authRepo.salvarCredencial(credencial, idPessoa, conn);

      // Se todas as 4 queries rodaram sem erro, commitamos!
      await conn.commit();
      
      return idPessoa;

    } catch (error) {
      await conn.rollback(); // Se a query 4 falhar, a 1, 2 e 3 são desfeitas automaticamente.
      throw new Error(`Erro ao salvar consultor: ${(error as Error).message}`);
    } finally {
      conn.release();
    };
  };
};

export default ConsultorTecnicoRepository;