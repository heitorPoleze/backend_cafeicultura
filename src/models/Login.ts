export class Login {
    private _email;
    
    private _senha;

    constructor(email: string, senha: string){
        this._email = this.validarEmail(email);
        //TODO: fazer hash da senha
        this._senha = senha;
    }

    get senha(): string {
        return this._senha;
    }

    get email(): string {
        return this._email;
    }

    set email(email: string) {
        this._email = this.validarEmail(email);
    }

    validarEmail(email: string): string {
        email = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) 
            throw new TypeError("Email inválido. Exemplo: usuario@dominio.com");
        return email;
    }

    toString(): string {
        return `
        \nEmail: ${this._email}
        \nSenha: ${this._senha}`;
    }
}
