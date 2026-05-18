export type CreateProprietarioDTO = {
  email: string;
  telefone: string;
  senha: string;
  tipoPessoa: "fisica" | "juridica";
  // Campos Pessoa Física
  nome?: string;
  cpf?: string;
  // Campos Pessoa Jurídica
  razaoSocial?: string;
  cnpj?: string;
  inscrEstadual?: string;
}   

export type ProprietarioResponseDTO = {
  id: number;
  tipoPessoa: "fisica" | "juridica";
  nomeOuRazao: string;
  documento: string;
  email: string;
  telefone: string;
  inscrEstadual?: string;
  dataCadastro: Date;
}