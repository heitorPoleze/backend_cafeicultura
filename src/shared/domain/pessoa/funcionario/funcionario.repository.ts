import { Prisma, PrismaClient } from "@prisma/client";
import Funcionario from "./funcionario.entity";
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";

class FuncionarioRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly pessoaRepo: PessoaRepository,
  ) {}

  public async salvarComTransacao(f: Funcionario): Promise<number> {
    // Inicia a transação (Unit of Work)
    return await this.prisma.$transaction(async (tx) => {
      // 1. Delega a criação da Pessoa (Física/Jurídica) passando o 'tx'
      const id = await this.pessoaRepo.salvar(f.pessoa, tx);

      // 2. O próprio repositório salva sua entidade principal
      await tx.funcionarios.create({
        data: {
          idPeFisica_PFK: id,
          ctps: f.ctps,
          salario: f.salario,
        },
      });

      return id;
    });
  };

  public async atualizarSalario(id: number, salario: number): Promise<boolean> {
    const result = await this.prisma.funcionarios.update({
      where: { idPeFisica_PFK: id },
      data: { salario: salario },
    });
    return result ? true : false;
  };

  public async buscarPorId(id: number): Promise<Funcionario | null> {
    const f = await this.prisma.funcionarios.findUnique({
      where: { idPeFisica_PFK: id },
    });

    if (!f) return null;

    const p = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: {
        pessoasfisicas: true,
        enderecos: true,
        usuarios: true,
      },
    });

    if (!p) return null;

    const e = p.enderecos;

    const endereco = e
      ? new Endereco(
          e.logradouro,
          e.bairro,
          e.cidade,
          e.uf,
          e.pais,
          e.cep,
          e.idEndereco_PK,
        )
      : null;

    const dados = {
      id: f.idPeFisica_PFK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf
    };

    // 4. Delega a criação para a Factory
    const pessoa = PessoaFactory.criarPessoa("fisica", dados);

    return new Funcionario(pessoa, f.ctps, Number(f.salario));
  };
};

export default FuncionarioRepository