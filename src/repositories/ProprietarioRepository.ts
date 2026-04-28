import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Proprietario } from "../models/Proprietario";
import { ProprietarioRow } from "./types/ProprietarioRow";

export class ProprietarioRepository {
    private _idProprietario: string;
    private _tabela: string;
    private _conexao: Pool;
    constructor(conexao: Pool){
        this._idProprietario = "pessoa_id";
        this._tabela = "proprietarios";
        this._conexao = conexao;
    }

    toDomain(row: ProprietarioRow): Proprietario {
        return new Proprietario(
            row.nome, 
            row.cpf, 
            row.id);
    }

    async cadastrarProprietario(proprietario: Proprietario): Promise<Proprietario>{
        const connection: PoolConnection = await this._conexao.getConnection();
        const sqlPessoa = `INSERT INTO pessoas (nome, cpf) VALUES (?, ?)`;
        const sqlProprietario = `INSERT INTO ${this._tabela} (${this._idProprietario}) VALUES (?)`;
        try{
            await connection.beginTransaction();

            const [resultPessoa] = await connection.query<ResultSetHeader>(sqlPessoa, [proprietario.nome, proprietario.cpf]);
            const pessoaId = resultPessoa.insertId;

            await connection.query<ResultSetHeader>(sqlProprietario, [pessoaId]);

            await connection.commit();

            return new Proprietario(proprietario.nome, proprietario.cpf, pessoaId);
        } catch (error) {
            await connection.rollback();
            throw new Error(`Erro ao cadastrar proprietário: ${error}`);
        } finally {
            connection.release();
        }
    }

    async buscarProprietarioPorId(id: number): Promise<Proprietario | null> {
        const sql = `
        SELECT p.nome, p.cpf, pr.${this._idProprietario} as id FROM pessoas p 
        JOIN ${this._tabela} pr 
        ON p.id = pr.${this._idProprietario} 
        WHERE pr.${this._idProprietario} = ?`;
        
        const [rows] = await this._conexao.query<ProprietarioRow[]>(sql, [id]);
        const result = rows[0];

        if (!result) 
            return null;
        return this.toDomain(result);
    }

}