import { Pool, PoolConnection, ResultSetHeader } from "mysql2/promise";
import { EnderecoRow } from "./types/EnderecoRow";
import { Endereco } from "../models/Endereco";

export class EnderecoRepository {
    private _idEndereco: string;
    private _tabela: string;
    private _conexao: Pool;
    constructor(conexao: Pool){
        this._idEndereco = "id";
        this._tabela = "enderecos";
        this._conexao = conexao;
    }

    toDomain(row: EnderecoRow): Endereco {
        return new Endereco(
            row.cep,
            row.pais,
            row.uf,
            row.cidade,
            row.bairro,
            row.logradouro,
            row.id
        );
    }

    async cadastrarEndereco(endereco: Endereco, connection?: PoolConnection): Promise<Endereco> {
        const sql = `INSERT INTO ${this._tabela} (cep, pais, uf, cidade, bairro, logradouro) VALUES (?, ?, ?, ?, ?, ?)`;
        const executor = connection || this._conexao;

        const [result] = await executor.query<ResultSetHeader>(sql, [
            endereco.CEP,
            endereco.pais,
            endereco.UF,
            endereco.cidade,
            endereco.bairro,
            endereco.logradouro
        ]);

        return new Endereco(
            endereco.CEP,
            endereco.pais,
            endereco.UF,
            endereco.cidade,
            endereco.bairro,
            endereco.logradouro,
            result.insertId
        );
    }

    async buscarEnderecoPorId(id: number): Promise<Endereco | null> {
        const sql = `SELECT * FROM ${this._tabela} WHERE ${this._idEndereco} = ?`;
        const [rows] = await this._conexao.query<EnderecoRow[]>(sql, [id]);
        const result = rows[0];

        if (!result) 
            return null;
        return this.toDomain(result);
    }
}