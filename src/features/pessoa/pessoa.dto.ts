import Endereco from "../../shared/domain/endereco/endereco.vo";

export type CreatePessoaDTO = {
    tipoPessoa: "fisica" | "juridica";
    nome?: string;
    cpf?: string;
    razaoSocial?: string;
    cnpj?: string;
    inscrEstadual?: string | null;
    endereco: Endereco | null;
    dataCadastro: Date;
};

export type CreateFuncionarioDTO = CreatePessoaDTO & {
    ctps: string;
    salario: number;
};

export type CreateClienteDTO = CreatePessoaDTO;
export type CreateFornecedorDTO = CreatePessoaDTO
export type CreateMeeiroDTO = CreatePessoaDTO;
export type CreatePrestadorDTO = CreatePessoaDTO;

export type updateSalarioFuncionarioDTO = {
    id: number;
    salario: number;
};

export type PessoaResponseDTO = {
    id: number;
    endereco: Endereco | null;
    dataCadastro: Date;
};

export type PessoaFisicaResponseDTO = PessoaResponseDTO & {
    nome: string;
    cpf: string;
};

export type PessoaJuridicaResponseDTO = PessoaResponseDTO & {
    razaoSocial: string;
    cnpj: string;
    inscrEstadual: string | null;
};

export type FuncionarioResponseDTO = PessoaFisicaResponseDTO & {
    ctps: string;
    salario: number;
};

export type MeeiroResponseDTO = PessoaFisicaResponseDTO;
export type PrestadorResponseDTO = PessoaFisicaResponseDTO;

export type ClienteResponseDTO = PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO;
export type FornecedorResponseDTO = PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO;