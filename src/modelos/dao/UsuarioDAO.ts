import { Pool, RowDataPacket } from 'mysql2/promise';
import Usuario from '../entidades/Usuario';
import PessoaDAO from './PessoaDAO';

abstract class UsuarioDAO extends PessoaDAO {
    
    constructor(conexao: Pool) {
        super(conexao, 'usuarios'); 
    }

    public async salvarUsuario(u: Usuario): Promise<number | null> {
        return await super.executarTransacao(async (conn) => {
            const idPessoa = await super.salvarPessoa(u.perfil, conn);
            if (!idPessoa) return null;
            await u.criptografarSenha();
            await super.salvar(
                `INSERT INTO ${this._tabela} 
                (idUsuario_PFK, email, telefone, senha) 
                VALUES (?,?,?,?);`,
                [idPessoa, u.email, u.telefone, u.senha],
                conn
            );
            return idPessoa;
        });
    };

    public async autenticarUsuario(entrada: string, senha: string): Promise<Usuario> {
        const tipoEntrada = await this.verificarEntrada(entrada);
        
        let usuario: Usuario | null = null;

        if (tipoEntrada === "EMAIL") {
            usuario = await this.buscarPorEmail(entrada); 
        } else if (tipoEntrada === "CPF") {
            usuario = await this.buscarPorCpf(entrada);
        } else if (tipoEntrada === "CNPJ") {
            usuario = await this.buscarPorCnpj(entrada); 
        }

        if (!usuario) {
            throw new Error("ERRO_USUARIO_NAO_ENCONTRADO");
        }

        const senhaCorreta = await usuario.compararSenha(senha);
        if (!senhaCorreta) {
            throw new Error("ERRO_SENHA_INCORRETA");
        }

        return usuario;
    }

    public async verificarEntrada(entrada: string): Promise<"CPF" | "CNPJ" | "EMAIL"> {
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(entrada)) {
            return "EMAIL";
        }

        const cpfRegexFormatado = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
        const cpfRegexNumeros = /^\d{11}$/;
        if (cpfRegexFormatado.test(entrada) || cpfRegexNumeros.test(entrada)) {
            return "CPF";
        }

        const cnpjRegexFormatado = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
        const cnpjRegexNumeros = /^\d{14}$/;
        if (cnpjRegexFormatado.test(entrada) || cnpjRegexNumeros.test(entrada)) {
            return "CNPJ";
        }

        throw new Error("ERRO_FORMATO_ENTRADA_DESCONHECIDO");
    };

    private async criarUsuario(
         sql: string,
        parametros: any[],
        buscaUnica: true
    ): Promise<Usuario | null>;
    private async criarUsuario(
        sql: string,
        parametros?: any[],
        buscaUnica?: false
    ): Promise<Usuario[]>;
    private async criarUsuario(
        sql: string,
        parametros?: any[],
        buscaUnica: boolean = false
    ): Promise<Usuario | Usuario[] | null> {
        const rows = buscaUnica
                    ? [await super.buscar<RowDataPacket>(sql, parametros!)].filter(Boolean)
                    : await super.listar<RowDataPacket>(sql, parametros);

        const usuarios: Usuario[] = [];

        for (const row of rows) {
            if (!row) continue;

            const pessoa = await this.buscarPessoa(row.idUsuario_PFK);
            const usuario = new Usuario(
                row.idUsuario_PFK,
                row.email,
                row.telefone,
                row.senha,
                pessoa!
            );
            usuarios.push(usuario);
        };
        return buscaUnica
            ? usuarios[0] ?? null
            : usuarios.length > 0 ? usuarios : null;
    };

    protected buscarPorEmail(email: string): Promise<Usuario | null> {
        return this.criarUsuario(
            `SELECT * FROM ${this._tabela} WHERE email = ?;`,
            [email],
            true
        );
    };

    protected abstract buscarPorCpf(cpf: string): Promise<Usuario | null>;
    protected abstract buscarPorCnpj(cnpj: string): Promise<Usuario | null>;
}

export default UsuarioDAO;