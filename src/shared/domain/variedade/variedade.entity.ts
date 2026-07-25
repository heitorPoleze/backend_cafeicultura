export default class Variedade {
    private id: number;
    private descricao: string;

    constructor(id: number, descricao: string) {
        this.id = id;
        this.descricao = descricao;
    }
    getId(): number {
        return this.id;
    }
    getDescricao(): string {
        return this.descricao;
    }
    toString(): string {
        return `Variedade [id=${this.id}, descricao=${this.descricao}]`;
    }

}