import Endereco from "../../shared/domain/endereco/endereco.vo";

export type CreatePessoaDTO = {
    tipoPessoa: "fisica" | "juridica";
    idAdministrador: number | null;
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
    idAdministrador: number | null;
    endereco: Endereco | null;
    dataCadastro: Date;
};

export type PessoaFisicaResponseDTO = PessoaResponseDTO & {
    nome: string;
    cpf: string;
    papel?: string | null;
};

export type PessoaJuridicaResponseDTO = PessoaResponseDTO & {
    razaoSocial: string;
    cnpj: string;
    inscrEstadual: string | null;
    papel?: string | null;
};

export type FuncionarioResponseDTO = PessoaFisicaResponseDTO & {
    ctps: string;
    salario: number;
};

export type MeeiroResponseDTO = PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO;
export type PrestadorResponseDTO = PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO;

export type ClienteResponseDTO = PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO;
export type FornecedorResponseDTO = PessoaFisicaResponseDTO | PessoaJuridicaResponseDTO;

export type ListarPessoasDTO = {
    idAdministrador: number;
    pagina: number;
    limite: number;
};