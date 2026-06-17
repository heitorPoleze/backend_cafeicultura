import Pessoa from "../../shared/domain/pessoa/pessoa.interface";

export type CreateUsuarioDTO = {
  email: string;
  telefone: string;
  senha: string;
};

export interface ResponseUsuarioDTO {
  email: string;
  telefone: string;
  perfil: Pessoa;
};