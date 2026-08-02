import { Prisma, PrismaClient } from "@prisma/client";
import Prestador from "./prestador.entity";
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";

class PrestadorRepository {
  constructor(
    private prisma: PrismaClient,
    private pessoaRepo: PessoaRepository,
  ) {}

  public async salvarComTransacao(p: Prestador): Promise<number> {
    // Inicia a transação (Unit of Work)
    return await this.prisma.$transaction(async (tx) => {
      // 1. Delega a criação da Pessoa (Física) passando o 'tx'
      const id = await this.pessoaRepo.salvar(p.pessoa, tx);

      // 2. O próprio repositório salva sua entidade principal
      await tx.prestadoresdeservico.create({
        data: { idPeFisica_PFK: id },
      });

      return id;
    });
  };
  public async buscarPrestadoresPorAdministrador(idAdministrador: number, pagina: number, limite: number): Promise<{ pagina: number; limite: number; dados: Prestador[] }> {
    const prestadoresDb = await this.prisma.prestadoresdeservico.findMany({
      include: {
        pessoasfisicas: {
          include: {
            enderecos: true
          }
        }
      },
      where: {  
        pessoasfisicas: {
          idAdministrador_FK: idAdministrador
        }
      },
      skip: (pagina - 1) * limite,
      take: limite
    });
    const prestadores: Prestador[] = [];
    for (const p of prestadoresDb) {
      const pessoa = await this.buscarPorId(p.idPeFisica_PFK);
      if (pessoa) {
        prestadores.push(pessoa);
      }
    }
    return {
      pagina,
      limite,
      dados: prestadores
    };
  }
  public async buscarPorId(id: number): Promise<Prestador | null> {
    const m = await this.prisma.prestadoresdeservico.findUnique({
      where: { idPeFisica_PFK: id },
    });

    if (!m) return null;

    const p = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: {
        pessoasfisicas: true,
        enderecos: true
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
      id: m.idPeFisica_PFK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf
    };

    // 4. Delega a criação para a Factory
    const pessoa = PessoaFactory.criarPessoa("fisica", dados);

    return new Prestador(pessoa);
  };
}

export default PrestadorRepository;