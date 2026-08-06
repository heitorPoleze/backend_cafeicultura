import IPessoa from '../pessoa.interface';
import PessoaFisica from '../pessoafisica.entity';
import PessoaJuridica from '../pessoajuridica.entity';

class Funcionario implements IPessoa {
    private _pessoa: PessoaFisica | PessoaJuridica;
    private _ctps: string;
    private _salario: number;

    constructor(pessoa: PessoaFisica | PessoaJuridica, ctps: string | null, salario: number) {
        this._pessoa = pessoa;
        if(ctps){
            this.validarCTPS(ctps);
            this._ctps = ctps;
        }else{
            this._ctps = "";
        }
        if(salario){
            this._salario = salario;
        }else{
            this._salario = 0;
        }
    };

    get pessoa(): PessoaFisica | PessoaJuridica {
        return this._pessoa;
    };

    get ctps(): string | null {
        if(!this._ctps || this._ctps.trim() === "") {
            return null;
        }
        return this._ctps;
    };

    get salario(): number  {
        return this._salario;
    };

    set salario(salario: number) {
        this.validarSalario(salario);
        this._salario = salario;
    };

    private validarCTPS(ctps: string) {
        if (!ctps || ctps.trim() === "") {
            throw new Error("CTPS é obrigatório.");
        };
        if (ctps.length > 14) {
            throw new Error("CTPS inválido. O CTPS deve conter até 14 caracteres.");
        };
    };

    private validarSalario(salario: number) {
        if (!salario) {
            throw new Error("Salário é obrigatório.");
        };
        if (salario <= 0) {
            throw new Error("Salário deve ser maior que zero.");
        };
    };

    public toJSON() {
        return this._pessoa.toJSON({
            ctps: this._ctps,
            salario: this._salario
        });
    };
}

export default Funcionario;