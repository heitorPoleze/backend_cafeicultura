import { Pool } from "mysql2/promise";
import { TalhaoRepository } from "../repositories/TalhaoRepository";
import { Talhao } from "../models/Talhao";
import { PropriedadeRepository } from "../repositories/PropriedadeRepository";
import { TamanhoRepository } from "../repositories/TamanhoRepository";
import { CriarTalhaoDTO } from "../api/dtos/TalhaoDTOs";
import { TalhaoMapper } from "../api/mappers/TalhaoMapper";

export class TalhaoService {
    private _talhaoRepository: TalhaoRepository;
    private _propriedadeRepository: PropriedadeRepository;
    private _tamanhoRepository: TamanhoRepository;  

    constructor(private readonly pool: Pool) {
        this._talhaoRepository = new TalhaoRepository(pool);
        this._propriedadeRepository = new PropriedadeRepository(pool);
        this._tamanhoRepository = new TamanhoRepository(pool);
    }

    async cadastrarTalhao(dtoTalhao: CriarTalhaoDTO): Promise<Talhao> {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();

            const propriedade = await this._propriedadeRepository.buscarPropriedadeCompletaPorId(dtoTalhao.id_propriedade);
            if (!propriedade) {
                throw new Error("Propriedade não encontrada.");
            }

            const talhao = TalhaoMapper.cadastroToDomain(dtoTalhao, propriedade);

            const tamanhoCadastrado = await this._tamanhoRepository.cadastrarTamanho(talhao.tamanho, connection);
            const talhaoCadastrado = await this._talhaoRepository.cadastrarTalhao(talhao, tamanhoCadastrado.id!, connection);
            const variedadesCadastradas = await this._talhaoRepository.cadastrarVariedades(talhaoCadastrado.id!, talhao.variedadesCafe, connection);

            await connection.commit();

            return new Talhao(
                talhao.nome,
                tamanhoCadastrado,
                propriedade,
                talhao.qtdPesDeCafe,
                talhao.tipoCafe,
                variedadesCadastradas,
                talhao.dataInicioTalhao,
                null,
                talhaoCadastrado.id
            );
            
        } catch (error) {
            await connection.rollback();
            throw new Error(`Erro ao cadastrar talhão: ${error}`);
        } finally {
            connection.release();
        }
    }

    async buscarTalhaoCompletoPorId(id: number): Promise<Talhao> {
        const talhao = await this._talhaoRepository.buscarTalhaoCompletoPorId(id);
        if (!talhao) {
            throw new Error("Talhão não encontrado.");
        }
        return talhao;
    }

    async buscarTalhoesPorPropriedadeId(propriedadeId: number): Promise<Talhao[]> {
        return await this._talhaoRepository.buscarTalhoesPorPropriedadeId(propriedadeId);
    }

}