import IPessoa from '../pessoa.interface';
import PessoaBase from '../pessoabase.entity';

class Funcionario implements IPessoa {
    private _pessoa: PessoaBase;
    private _ctps: string;
    private _salario: number;

    constructor(pessoa: PessoaBase, ctps: string | null, salario: number = 0.00) {
        this._pessoa = pessoa;
        this._ctps = ctps || '';
        this._salario = salario;
    };

    get pessoa(): PessoaBase {
        return this._pessoa;
    };

    get ctps(): string | null {
        if (!this._ctps || this._ctps.trim() === "") {
            return null;
        }
        return this._ctps;
    };

    get salario(): number {
        return this._salario;
    };

    set salario(salario: number) {
        this._salario = salario;
    };

    public toJSON() {
        return this._pessoa.toJSON({
            ctps: this._ctps,
            salario: this._salario
        });
    };
}

export default Funcionario;