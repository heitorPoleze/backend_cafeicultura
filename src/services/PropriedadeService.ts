import { Pool, PoolConnection, ResultSetHeader } from "mysql2/promise";
import { Propriedade } from "../models/Propriedade";
import { PropriedadeRepository } from "../repositories/PropriedadeRepository";
import { EnderecoRepository } from "../repositories/EnderecoRepository";
import { TamanhoRepository } from "../repositories/TamanhoRepository";

export class PropriedadeService {
    private _propriedadeRepository: PropriedadeRepository;
    private _enderecoRepository: EnderecoRepository;
    private _tamanhoRepository: TamanhoRepository;

    constructor(private readonly pool: Pool) {
        this._propriedadeRepository = new PropriedadeRepository(pool);
        this._enderecoRepository = new EnderecoRepository(pool);
        this._tamanhoRepository = new TamanhoRepository(pool);
    }

    async cadastrarPropriedade(propriedade: Propriedade): Promise<Propriedade> {
        const connection: PoolConnection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();

            const enderecoCadastrado = await this._enderecoRepository.cadastrarEndereco(propriedade.endereco, connection);
        
            const tamanhoCadastrado = await this._tamanhoRepository.cadastrarTamanho(propriedade.tamanho, connection);
            const sqlPropriedade = `INSERT INTO propriedades (nome, proprietario_id, endereco_id, tamanho_id) VALUES (?, ?, ?, ?)`;
            const [result] = await connection.query<ResultSetHeader>(sqlPropriedade, [
                propriedade.nome,
                propriedade.proprietario.id,
                enderecoCadastrado.id,
                tamanhoCadastrado.id
            ]);
            const propriedadeId = result.insertId;

            await connection.commit();

            return new Propriedade(
                propriedade.nome,
                propriedade.proprietario,
                enderecoCadastrado,
                tamanhoCadastrado,
                propriedadeId
            );
        } catch (error) {
            await connection.rollback();
            throw new Error(`Erro ao cadastrar propriedade: ${error}`);
        } finally {
            connection.release();
        }
    }

    async buscarPropriedadeCompletaPorId(id: number): Promise<Propriedade | null> {
        return await this._propriedadeRepository.buscarPropriedadeCompletaPorId(id);
    }

    async buscarPropriedadesPorProprietarioId(proprietarioId: number): Promise<Propriedade[]> {
        return await this._propriedadeRepository.buscarPropriedadesPorProprietarioId(proprietarioId);
    }
}