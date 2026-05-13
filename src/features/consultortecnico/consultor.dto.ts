export type CreateConsultorDTO = {
  email: string;
  telefone: string;
  senha: string;
  nome: string;
  cpf: string;
}

export type ConsultorResponseDTO = {
  id: number | undefined;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataCadastro: Date;
}