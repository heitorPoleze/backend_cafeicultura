import { Pool, PoolConnection, ResultSetHeader } from "mysql2/promise";
import { TamanhoRow } from "./types/TamanhoRow";
import { Tamanho } from "../models/Tamanho";

export class TamanhoRepository {
    private _idTamanho: string;
    private _tabela: string;
    private _conexao: Pool;
    constructor(conexao: Pool){
        this._idTamanho = "id";
        this._tabela = "tamanhos";
        this._conexao = conexao;
    }

    toDomain(row: TamanhoRow): Tamanho {
        return new Tamanho(
            row.area,
            row.unidade_medida as "m²" | "ha",
            row.id
        );
    }

    async cadastrarTamanho(tamanho: Tamanho, connection?: PoolConnection): Promise<Tamanho> {
        const executor = connection || this._conexao;
        const sql = `INSERT INTO ${this._tabela} (area, unidade_medida) VALUES (?, ?)`;
        
        const [result] = await executor.query<ResultSetHeader>(sql, [tamanho.area, tamanho.unidade_medida]);
    
        return new Tamanho(tamanho.area, tamanho.unidade_medida, result.insertId);
        
    }

    async buscarTamanhoPorId(id: number): Promise<Tamanho | null> {
        const sql = `SELECT * FROM ${this._tabela} WHERE ${this._idTamanho} = ?`;
        const [rows] = await this._conexao.query<TamanhoRow[]>(sql, [id]);
        const result = rows[0];

        if (!result) 
            return null;
        return this.toDomain(result);
    }
    
}