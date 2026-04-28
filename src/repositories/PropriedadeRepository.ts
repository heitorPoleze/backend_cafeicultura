import { Pool } from "mysql2/promise";
import { PropriedadeCompletaRow, PropriedadeRow } from "./types/PropriedadeRow";
import { Propriedade } from "../models/Propriedade";
import { ProprietarioRepository } from "./ProprietarioRepository";
import { EnderecoRepository } from "./EnderecoRepository";
import { TamanhoRepository } from "./TamanhoRepository";
import { Proprietario } from "../models/Proprietario";
import { Endereco } from "../models/Endereco";
import { Tamanho } from "../models/Tamanho";

export class PropriedadeRepository {
    private _idPropriedade: string;
    private _tabela: string;
    private _conexao: Pool;
    constructor(conexao: Pool){
        this._idPropriedade = "id";
        this._tabela = "propriedades";
        this._conexao = conexao;
    }

    toDomain(row: PropriedadeCompletaRow): Propriedade {
        const proprietario = new Proprietario(
            row.proprietario_nome,
            row.proprietario_cpf,
            row.proprietario_id
        );
        const endereco = new Endereco(
            row.endereco_cep,
            row.endereco_pais,
            row.endereco_uf,
            row.endereco_cidade,
            row.endereco_bairro,
            row.endereco_logradouro,
            row.endereco_id
        );
        const tamanho = new Tamanho(
            row.tamanho_area,
            row.tamanho_unidade_medida,
            row.tamanho_id
        );
        return new Propriedade(
            row.nome,
            proprietario,
            endereco,
            tamanho,
            row.id
        );
    }

    async buscarPropriedadeCompletaPorId(id: number): Promise<Propriedade | null> {
        const sql = `
                SELECT pr.id, pr.nome, p.id as proprietario_id, p.nome as proprietario_nome, p.cpf as proprietario_cpf, e.id as endereco_id, e.cep as endereco_cep, e.pais as endereco_pais, e.uf as endereco_uf, e.cidade as endereco_cidade, e.bairro as endereco_bairro, e.logradouro as endereco_logradouro, t.id as tamanho_id, t.area as tamanho_area, t.unidade_medida as tamanho_unidade_medida
                FROM ${this._tabela} pr
                JOIN pessoas p ON pr.proprietario_id = p.id
                JOIN enderecos e ON pr.endereco_id = e.id
                JOIN tamanhos t ON pr.tamanho_id = t.id
                WHERE pr.${this._idPropriedade} = ?`;
                
        const [rows] = await this._conexao.query<PropriedadeCompletaRow[]>(sql, [id]);
        const result = rows[0];
        if (!result) 
            return null;
        return this.toDomain(result);
    }
}