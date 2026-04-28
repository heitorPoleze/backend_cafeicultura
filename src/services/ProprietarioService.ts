import { Proprietario } from "../models/Proprietario";
import { ProprietarioRepository } from "../repositories/ProprietarioRepository";

export class ProprietarioService {
    constructor(private readonly proprietarioRepository: ProprietarioRepository) {}

    async cadastrarProprietario(dados: { nome: string; cpf: string }): Promise<Proprietario> {
        const proprietario = new Proprietario(dados.nome, dados.cpf);
        try{
            const novoProprietario = await this.proprietarioRepository.cadastrarProprietario(proprietario);
            return novoProprietario;
        } catch (error) {
            throw new Error(`Erro ao cadastrar proprietário: ${error}`);
        }
    }
}
