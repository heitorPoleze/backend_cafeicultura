import AuthRepository from "./auth.repository";

class AuthService {
  constructor(private repo: AuthRepository) {}

  public async autenticar(
    entrada: string,
    senha: string,
    tipoEntrada: "email" | "cpf" | "cnpj",
  ) {
    const resultado = await this.repo.autenticar(entrada, tipoEntrada);

    const erroAutenticacao = new Error("CREDENCIAIS_INVALIDAS");

    if (!resultado) {
      throw erroAutenticacao;
    };

    const { credencial, nomeSessao } = resultado;

    const senhaValida = await credencial.compararSenha(senha);

    if (!senhaValida) {
      throw erroAutenticacao;
    };

    return {
      idUsuario: credencial.idUsuario,
      nome: nomeSessao,
    };
  }
}

export default AuthService;
