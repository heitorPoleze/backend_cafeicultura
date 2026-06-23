import Pessoa from './pessoa.type';
import PessoaBase from './pessoabase.entity';
import PessoaFisica from './pessoafisica.entity';
import PessoaJuridica from './pessoajuridica.entity';

class PessoaFactory {
  public static criarPessoa(tipo: 'fisica' | 'juridica', dados: Pessoa) {
    if (tipo === 'fisica') {
      return new PessoaFisica(
        dados.id,
        dados.nome!,
        dados.cpf!,
        dados.endereco,
        dados.dataCadastro
      );
    } else if (tipo === 'juridica') {
      return new PessoaJuridica(
        dados.id,
        dados.cnpj!,
        dados.razaoSocial!,
        dados.inscrEstadual!,
        dados.endereco,
        dados.dataCadastro
      );
    };

    throw new Error(`Tipo de pessoa inválido: ${tipo}`);
  };
};

export default PessoaFactory;