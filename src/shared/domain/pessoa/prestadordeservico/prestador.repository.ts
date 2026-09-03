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
        pessoas: true
      },
      where: {  
        pessoas: {
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
    if(!id || id <= 0 || !Number.isInteger(id)) {
      throw new Error("ID_INVALIDO");
    }
    const m = await this.prisma.prestadoresdeservico.findUnique({
      where: { idPeFisica_PFK: id },
    });

    if (!m) return null;

    const p = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: {
        pessoasfisicas: true,
        pessoasjuridicas: true,
        enderecos: true
      },
    });

    if (!p) return null;

    const e = p.enderecos;

    const endereco = e
      ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
      : null;
      
  let dados 
  if(p.pessoasfisicas?.cpf){
      dados = {
        id: m.idPeFisica_PFK,
        idAdministrador: p.idAdministrador_FK,
        dataCadastro: p.dataCadastro,
        endereco: endereco,
        nome: p.pessoasfisicas?.nome,
        cpf: p.pessoasfisicas?.cpf
    }
  }else{
     dados = {
      id: m.idPeFisica_PFK,
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      razaoSocial:p.pessoasjuridicas?.razaoSocial,
      inscrEstadual:p.pessoasjuridicas?.inscEstadual,
      cnpj:p.pessoasjuridicas?.cnpj
      
    }
  }
    

    // 4. Delega a criação para a Factory
    let pessoa;
    if(dados.cpf){
       pessoa = PessoaFactory.criarPessoa("fisica", dados);
    }else{
      pessoa = PessoaFactory.criarPessoa("juridica", dados)
    }

    return new Prestador(pessoa);
  };

  public async excluir(prestador: Prestador): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.prestadoresdeservico.delete({
          where: { idPeFisica_PFK: prestador.pessoa.id! }
        });
        await tx.pessoasfisicas.delete({
          where: { idPeFisica_PFK: prestador.pessoa.id! }
        });
        await this.pessoaRepo.excluirPessoa(prestador.pessoa, tx);
        if (!await this.pessoaRepo.removerEndereco(prestador.pessoa.id!, tx)) {
          throw new Error("ERRO_REMOVER_ENDERECO");
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("PRESTADOR_POSSUI_ASSOCIACOES");
      }
      throw error;
    }
  };
}

export default PrestadorRepository;