import { Endereco } from "../../models/Endereco";
import { Propriedade } from "../../models/Propriedade";
import { Proprietario } from "../../models/Proprietario";
import { Talhao } from "../../models/Talhao";
import { Tamanho } from "../../models/Tamanho";
import { CriarTalhaoDTO, TalhaoCompletoDTO } from "../dtos/TalhaoDTOs";

export class TalhaoMapper {
    static toDomain(dto: TalhaoCompletoDTO){
        const proprietario = new Proprietario(
            dto.propriedade.proprietario.nome,
            dto.propriedade.proprietario.cpf
        );

        const endereco = new Endereco(
            dto.propriedade.endereco.CEP,
            dto.propriedade.endereco.pais,
            dto.propriedade.endereco.UF,
            dto.propriedade.endereco.cidade,
            dto.propriedade.endereco.bairro,
            dto.propriedade.endereco.logradouro
        );

        const tamanhoPropriedade = new Tamanho(
            dto.propriedade.tamanho.area,
            dto.propriedade.tamanho.unidade_medida
        );

        const propriedade = new Propriedade(
            dto.propriedade.nome,
            proprietario,
            endereco,
            tamanhoPropriedade
        );

        const tamanhoTalhao = new Tamanho(
            dto.tamanho.area,
            dto.tamanho.unidade_medida
        );

        return new Talhao(
            dto.nome,
            tamanhoTalhao,
            propriedade,
            dto.qtd_pes_cafe,
            dto.tipo_cafe,
            dto.variedades_cafe,
            dto.data_inicio_talhao,
            dto.data_fim_talhao
        );
    }

    static cadastroToDomain(dto: CriarTalhaoDTO, propriedade: Propriedade){
        const tamanhoTalhao = new Tamanho(
            dto.tamanho.area,
            dto.tamanho.unidade_medida
        );

        return new Talhao(
            dto.nome,
            tamanhoTalhao,
            propriedade,
            dto.qtd_pes_cafe,
            dto.tipo_cafe,
            dto.variedades_cafe,
            new Date(dto.data_inicio_talhao),
            null
        );
    }
}