export type LoginRequestDTO = {
  tipoEntrada: "email" | "cpf" | "cnpj";
  entrada: string;
  senha: string;
}

export type LoginResponseDTO = {
  mensagem: string;
  dadosSessao: { id: number; nome: string };
};

export type LogoutResponseDTO = {
  mensagem: string;
};