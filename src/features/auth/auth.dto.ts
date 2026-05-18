// src/features/auth/auth.dto.ts

export type LoginRequestDTO = {
  tipoEntrada: "email" | "cpf" | "cnpj";
  entrada: string;
  senha: string;
}

export type LoginResponseDTO = {
  mensagem: string;
  sessaoAtiva?: {
    idUsuario: number;
    nome: string;
  };
}