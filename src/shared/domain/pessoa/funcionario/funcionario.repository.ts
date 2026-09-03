import { Prisma, PrismaClient } from "@prisma/client";
import Funcionario from "./funcionario.entity";
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";
import { BuscaPaginadaDTO, FuncionarioResponseDTO } from "../../../../features/pessoa/pessoa.dto";

class FuncionarioRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly pessoaRepo: PessoaRepository,
  ) { }

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
     if(!id || id <= 0 || !Number.isInteger(id)) {
      throw new Error("ID_INVALIDO");
    }
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
      ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
      : null;

    const dados = {
      id: f.idPeFisica_PFK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf
    };

    // 4. Delega a criação para a Factory
    const pessoa = PessoaFactory.criarPessoa("fisica", dados);

    return new Funcionario(pessoa, f.ctps, Number(f.salario));
  };

  public async listarFuncionarios(idAdministrador: number, pagina: number, limite: number): Promise<BuscaPaginadaDTO> {
    const pessoas = await this.prisma.pessoas.findMany({
      where: { idAdministrador_FK: idAdministrador },
      include: {
        pessoasfisicas: true,
        enderecos: true,
        usuarios: true,
      },
      skip: (pagina - 1) * limite,
      take: limite
    });

    if (!pessoas || pessoas.length === 0) return { pagina, limite, dados: [] };

    const pessoasIds = pessoas.map((p) => p.idPessoa_PK);

    const funcionariosData = await this.prisma.funcionarios.findMany({
      where: { idPeFisica_PFK: { in: pessoasIds } },
    });

    const funcionarios: FuncionarioResponseDTO[] = [];

    pessoas.forEach((p) => {
      const funcData = funcionariosData.find((f) => f.idPeFisica_PFK === p.idPessoa_PK);

      if (p.pessoasfisicas && funcData) {
        const e = p.enderecos;

        const endereco = e
          ? new Endereco(
            e.cidade,
            e.bairro,
            e.cep,
            e.uf,
            e.pais,
            e.logradouro,
            e.idEndereco_PK,
          )
          : null;

        funcionarios.push({
          id: p.idPessoa_PK,
          idAdministrador: p.idAdministrador_FK,
          dataCadastro: p.dataCadastro,
          endereco: endereco,
          nome: p.pessoasfisicas.nome,
          cpf: p.pessoasfisicas.cpf,
          ctps: funcData.ctps,
          salario: Number(funcData.salario),
        });
      }
    });

    return { pagina, limite, dados: funcionarios };
  }

  public async excluir(funcionario: Funcionario): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.funcionarios.delete({
          where: { idPeFisica_PFK: funcionario.pessoa.id! }
        });
        await tx.pessoasfisicas.delete({
          where: { idPeFisica_PFK: funcionario.pessoa.id! }
        });
        await this.pessoaRepo.excluirPessoa(funcionario.pessoa, tx);
        if (!await this.pessoaRepo.removerEndereco(funcionario.pessoa.id!, tx)) {
          throw new Error("ERRO_REMOVER_ENDERECO");
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("FUNCIONARIO_POSSUI_ASSOCIACOES");
      }
      throw error;
    }
  };
}
export default FuncionarioRepository