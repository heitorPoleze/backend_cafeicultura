import UsuarioRepository from "./usuario.repository";
import Usuario from "./usuario.entity";

export default class UsuarioService {
  // constructor(private readonly usuarioRepository: UsuarioRepository) {}

  // /**
  //  * Obtém os dados do usuário e os formata para o padrão DTO.
  //  */
  // public async obterPerfil(id: number): Promise<ReturnUsuarioDTO | null> {
  //   const usuario = await this.usuarioRepository.buscarPorId(id);
  //   if (!usuario) return null;

  //   return this.mapToDTO(usuario);
  // }

  // /**
  //  * Converte a Entidade de Domínio para um Objeto de Transferência de Dados (DTO).
  //  */
  // private mapToDTO(usuario: Usuario): ReturnUsuarioDTO {
  //   return {
  //     idUsuario: usuario.idPessoa,
  //     nomeCompleto: usuario.nomeExibicao || "Usuário", 
  //     nomeExibicao: usuario.nomeExibicao || "Usuário",
  //     email: usuario.email,
  //     telefone: usuario.telefone,
  //     documento: usuario.documentos || [],
  //     dataCadastro: usuario.idPessoa ? (usuario as unknown as { _pessoa: { dataCadastro: Date } })._pessoa.dataCadastro : new Date(),
  //     endereco: usuario.endereco ? {
  //       idEndereco: usuario.endereco.idEndereco || 0,
  //       cidade: usuario.endereco.cidade,
  //       bairro: usuario.endereco.bairro,
  //       cep: usuario.endereco.cep,
  //       uf: usuario.endereco.uf,
  //       pais: usuario.endereco.pais,
  //       logradouro: usuario.endereco.logradouro
  //     } : undefined
  //   };
  // }
}