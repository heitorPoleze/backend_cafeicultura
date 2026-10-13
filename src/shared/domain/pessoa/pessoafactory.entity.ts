import Pessoa from './pessoa.dto';
import PessoaBase from './pessoabase.entity';
import PessoaFisica from './pessoafisica.entity';
import PessoaJuridica from './pessoajuridica.entity';

class PessoaFactory {
  public static criarPessoa(tipo: 'fisica' | 'juridica', dados: Pessoa) : PessoaBase {
    switch (tipo) {
      case 'fisica':
        return new PessoaFisica(
          dados.id,
          dados.idAdministrador,
          dados.nome!,
          dados.cpf ?? null,
          dados.endereco,
          dados.dataCadastro,
          dados.papel
        );
      case 'juridica':
        return new PessoaJuridica(
          dados.id,
          dados.idAdministrador,
          dados.cnpj ?? null,
          dados.razaoSocial ?? "",
          dados.inscrEstadual ?? null,
          dados.endereco,
          dados.dataCadastro,
          dados.papel
        );
      default:
        throw new Error(`Tipo de pessoa inválido: ${tipo}`);
    };
  };
};

export default PessoaFactory;