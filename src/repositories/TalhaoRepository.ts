import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { TalhaoCompletoRow, TalhaoVariedadeRow } from "./types/TalhaoRow";
import { Talhao } from "../models/Talhao";
import { Endereco } from "../models/Endereco";
import { Proprietario } from "../models/Proprietario";
import { Propriedade } from "../models/Propriedade";
import { Tamanho } from "../models/Tamanho";

export class TalhaoRepository {
    private _idTalhao: string;
    private _tabela: string;
    private _conexao: Pool;

    constructor(conexao: Pool){
        this._idTalhao = "id";
        this._tabela = "talhoes";
        this._conexao = conexao;
    }

    mapVariedadeToArray(variedades: TalhaoVariedadeRow[]): string[] {
        return variedades.map((v) => v.nome_variedade).filter((nome): nome is string => !!nome);
    }

    toDomain(row: TalhaoCompletoRow, variedades: string[]): Talhao {
        const propriedade = new Propriedade(
            row.propriedade_nome,
            new Proprietario(
                row.propriedade_proprietario_nome,
                row.propriedade_proprietario_cpf,
                row.propriedade_proprietario_id
            ),
            new Endereco(
                row.propriedade_endereco_cep,
                row.propriedade_endereco_pais,
                row.propriedade_endereco_uf,
                row.propriedade_endereco_cidade,
                row.propriedade_endereco_bairro,
                row.propriedade_endereco_logradouro,
                row.propriedade_endereco_id
            ),
            new Tamanho(
                row.propriedade_tamanho_area,
                row.propriedade_tamanho_unidade_medida,
                row.propriedade_tamanho_id
            )
        );
        return new Talhao(
            row.nome,
            new Tamanho(
                row.tamanho_area,
                row.tamanho_unidade_medida,
                row.tamanho_id
            ),
            propriedade,
            row.qtd_pes_cafe,
            row.tipo_cafe,
            variedades,
            row.data_inicio_talhao,
            row.data_fim_talhao,
            row.id
        );
    }

    async buscarTalhaoCompletoPorId(id: number): Promise<Talhao | null> {
        const sqlTalhao = `
        SELECT 
            -- Dados do Talhão
            t.id, 
            t.nome, 
            t.qtd_pes_cafe, 
            t.tipo_cafe, 
            t.data_inicio_talhao, 
            t.data_fim_talhao,
            
            -- Tamanho do Talhão
            t.tamanho_id, 
            ta.area as tamanho_area, 
            ta.unidade_medida as tamanho_unidade_medida,

            -- Dados da Propriedade
            p.id as propriedade_id, 
            p.nome as propriedade_nome,
            
            -- Proprietário (Join com Pessoas para pegar nome/cpf)
            pe.id as propriedade_proprietario_id, 
            pe.nome as propriedade_proprietario_nome, 
            pe.cpf as propriedade_proprietario_cpf,
            
            -- Endereço da Propriedade
            e.id as propriedade_endereco_id, 
            e.cep as propriedade_endereco_cep, 
            e.pais as propriedade_endereco_pais, 
            e.uf as propriedade_endereco_uf, 
            e.cidade as propriedade_endereco_cidade, 
            e.bairro as propriedade_endereco_bairro, 
            e.logradouro as propriedade_endereco_logradouro,
            
            -- Tamanho da Propriedade (Usando a FK de propriedades)
            tp.id as propriedade_tamanho_id, 
            tp.area as propriedade_tamanho_area, 
            tp.unidade_medida as propriedade_tamanho_unidade_medida

        FROM talhoes t
        JOIN tamanhos ta ON t.tamanho_id = ta.id
        JOIN propriedades p ON t.propriedade_id = p.id
        JOIN proprietarios pr ON p.proprietario_id = pr.pessoa_id
        JOIN pessoas pe ON pr.pessoa_id = pe.id -- Necessário para nome e cpf
        JOIN enderecos e ON p.endereco_id = e.id
        JOIN tamanhos tp ON p.tamanho_id = tp.id -- Tamanho vinculado à propriedade
        WHERE t.id = ?;
        `;

        const [rowsTalhao] = await this._conexao.query<TalhaoCompletoRow[]>(sqlTalhao, [id]);
        const resultTalhao = rowsTalhao[0];
        if (!resultTalhao) {
            return null;
        }

        const sqlVariedades = `
        SELECT v.nome as nome_variedade, tv.talhao_id, tv.variedade_id
        FROM talhao_variedades tv  -- Ajustado aqui 
        JOIN variedades v ON tv.variedade_id = v.id
        WHERE tv.talhao_id = ?;
        `;

        const [rowsVariedades] = await this._conexao.query<TalhaoVariedadeRow[]>(sqlVariedades, [id]);
        const listaNomesVariedades = rowsVariedades.map(v => v.nome_variedade!);

        return this.toDomain(resultTalhao, listaNomesVariedades);
    }

    async cadastrarVariedades(talhaoId: number, variedades: string[], connection: PoolConnection): Promise<string[]> {
        const sqlUpsert = `
        INSERT INTO variedades (nome) 
        VALUES (?) 
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
        `;

        const sqlVinculo = `
        INSERT IGNORE INTO talhao_variedades (talhao_id, variedade_id) 
        VALUES (?, ?)
        `;

        for (const nome of variedades) {
            const [result] = await connection.query<ResultSetHeader>(sqlUpsert, [nome]);

            if (!result.insertId) {
            throw new Error(`Falha ao gerar ID para a variedade: ${nome}`);
            }

            await connection.query(sqlVinculo, [talhaoId, result.insertId]);
            }
        return variedades;
    }

    async cadastrarTalhao(talhao: Talhao, tamanhoId: number, connection: PoolConnection): Promise<Talhao> {
        const sql = `INSERT INTO ${this._tabela} (nome, propriedade_id, tamanho_id, qtd_pes_cafe, tipo_cafe, data_inicio_talhao, data_fim_talhao) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const executor = connection || this._conexao;

        const [result] = await executor.query<ResultSetHeader>(sql, [
            talhao.nome,
            talhao.propriedade.id,
            tamanhoId,
            talhao.qtdPesDeCafe,
            talhao.tipoCafe,
            talhao.dataInicioTalhao,
            talhao.dataFimTalhao || null
        ]);
        
        return new Talhao(
            talhao.nome,
            talhao.tamanho,
            talhao.propriedade,
            talhao.qtdPesDeCafe,
            talhao.tipoCafe,
            talhao.variedadesCafe,
            talhao.dataInicioTalhao,
            talhao.dataFimTalhao || null,
            result.insertId
        );
    }

    async buscarTalhoesPorPropriedadeId(propriedadeId: number): Promise<Talhao[]> {
    const sql = `
        SELECT 
            t.id, t.nome, t.qtd_pes_cafe, t.tipo_cafe, t.data_inicio_talhao, t.data_fim_talhao,
            ta.id as tamanho_id, ta.area as tamanho_area, ta.unidade_medida as tamanho_unidade_medida,
            p.id as propriedade_id, p.nome as propriedade_nome,
            en.id as endereco_id, en.cep as endereco_cep, en.pais as endereco_pais, en.uf as endereco_uf, 
            en.cidade as endereco_cidade, en.bairro as endereco_bairro, en.logradouro as endereco_logradouro,
            pr.id as proprietario_id, pr.nome as proprietario_nome, pr.cpf as proprietario_cpf,
            pt.id as prop_tamanho_id, pt.area as prop_tamanho_area, pt.unidade_medida as prop_tamanho_unidade_medida
        FROM ${this._tabela} t
        JOIN tamanhos ta ON t.tamanho_id = ta.id
        JOIN propriedades p ON t.propriedade_id = p.id
        JOIN enderecos en ON p.endereco_id = en.id
        JOIN pessoas pr ON p.proprietario_id = pr.id
        JOIN tamanhos pt ON p.tamanho_id = pt.id
        WHERE t.propriedade_id = ?;
    `;

    const [rows] = await this._conexao.query<any[]>(sql, [propriedadeId]);

    return rows.map(row => {
        const propriedade = new Propriedade(
            row.propriedade_nome,
            new Proprietario(row.proprietario_nome, row.proprietario_cpf, row.proprietario_id),
            new Endereco(
                row.endereco_cep, row.endereco_pais, row.endereco_uf, 
                row.endereco_cidade, row.endereco_bairro, row.endereco_logradouro, 
                row.endereco_id
            ),
            new Tamanho(row.prop_tamanho_area, row.prop_tamanho_unidade_medida, row.prop_tamanho_id),
            row.propriedade_id
        );

        return new Talhao(
            row.nome,
            new Tamanho(row.tamanho_area, row.tamanho_unidade_medida, row.tamanho_id),
            propriedade,
            row.qtd_pes_cafe,
            row.tipo_cafe,
            [],
            new Date(row.data_inicio_talhao),
            row.data_fim_talhao ? new Date(row.data_fim_talhao) : null,
            row.id
        );
    });
}

}