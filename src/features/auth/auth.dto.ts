export type LoginRequestDTO = {
  tipoEntrada: "email" | "cpf" | "cnpj";
  entrada: string;
  senha: string;
}

export type LoginResponseDTO = {
  mensagem: string;
  dadosSessao: { id: number; nome: string; tipoConta: "fisica" | "juridica" };
};

export type LogoutResponseDTO = {
  mensagem: string;
};