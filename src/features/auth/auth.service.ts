import AuthRepository from "./auth.repository";

class AuthService {
  constructor(private repo: AuthRepository) {}

  public async autenticar(
    entrada: string,
    senhaLimpa: string,
    tipoEntrada: "email" | "cpf" | "cnpj",
  ) {
    const resultado = await this.repo.buscarParaLogin(entrada, tipoEntrada);

    const erroAutenticacao = new Error("Credenciais inválidas. Verifique seu usuário e senha.");

    if (!resultado) {
      throw erroAutenticacao;
    }

    const { credencial, nomeSessao } = resultado;

    const senhaValida = await credencial.compararSenha(senhaLimpa);

    if (!senhaValida) {
      throw erroAutenticacao;
    }

    return {
      idUsuario: credencial.idUsuario as number,
      nome: nomeSessao,
    };
  }
}

export default AuthService;
