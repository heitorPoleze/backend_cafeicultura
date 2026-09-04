import { Prisma, PrismaClient } from "@prisma/client";
import Cliente from './cliente.entity';
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";
import PessoaJuridica from "../pessoajuridica.entity";
import PessoaFisica from "../pessoafisica.entity";

class ClienteRepository {
    constructor(
        private prisma: PrismaClient,
        private pessoaRepo: PessoaRepository
    ) {};

    public async salvarComTransacao(c: Cliente): Promise<number> {
    
    // Inicia a transação (Unit of Work)
    return await this.prisma.$transaction(async (tx) => {
      
      // 1. Delega a criação da Pessoa (Física/Jurídica) passando o 'tx'
      const id = await this.pessoaRepo.salvar(c.pessoa, tx);
      
      // 2. O próprio repositório salva sua entidade principal
      await tx.clientes.create({ 
        data: { idCliente_PFK: id } 
      });

      return id;
    });
  };
  public async buscarClientesPorAdministrador(idAdministrador: number): Promise<{ dados: Cliente[] }> {
    const clientesDb = await this.prisma.clientes.findMany({
      include: {
        pessoas: true
      },
      where: {
        pessoas: {
          idAdministrador_FK: idAdministrador
        }
      }
    });
    const clientes: Cliente[] = [];
    for (const c of clientesDb) {
      const pessoa = await this.buscarPorId(c.idCliente_PFK);
      if (pessoa) {
        clientes.push(pessoa);
      }
    }
    return { dados: clientes };
  }
  public async buscarPorId(id: number): Promise<Cliente | null> {
     if(!id || id <= 0 || !Number.isInteger(id)) {
      throw new Error("ID_INVALIDO");
    }
    const c = await this.prisma.clientes.findUnique({
      where: { idCliente_PFK: id }
    });

    if (!c) return null;

    const p = await this.prisma.pessoas.findUnique({
      where: { idPessoa_PK: id },
      include: {
        pessoasfisicas: true,
        pessoasjuridicas: true,
        enderecos: true
      }
    });

    if (!p) return null;

    const e = p.enderecos;
    
    const endereco = e 
      ? new Endereco(e.cidade, e.bairro, e.cep, e.uf, e.pais, e.logradouro, e.idEndereco_PK)
      : null;

    const tipoPessoa = p.pessoasfisicas ? 'fisica' : 'juridica';

    const dados = {
      id: c.idCliente_PFK, 
      idAdministrador: p.idAdministrador_FK,
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf,
      razaoSocial: p.pessoasjuridicas?.razaoSocial,
      cnpj: p.pessoasjuridicas?.cnpj,
      inscEstadual: p.pessoasjuridicas?.inscEstadual
    };

    const pessoa = PessoaFactory.criarPessoa(tipoPessoa, dados);

    return new Cliente(pessoa);
  };

  public async excluir(cliente: Cliente): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.clientes.delete({
          where: { idCliente_PFK: cliente.pessoa.id! }
        });
        if (cliente.pessoa instanceof PessoaJuridica) {
          await tx.pessoasjuridicas.delete({
            where: { idPeJuridica_PFK: cliente.pessoa.id! }
          });
        } else if (cliente.pessoa instanceof PessoaFisica) {
          await tx.pessoasfisicas.delete({
            where: { idPeFisica_PFK: cliente.pessoa.id! }
          });
        }
        await this.pessoaRepo.excluirPessoa(cliente.pessoa, tx);
        if (!await this.pessoaRepo.removerEndereco(cliente.pessoa.id!, tx)) {
          throw new Error("ERRO_REMOVER_ENDERECO");
        }
        
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error("CLIENTE_POSSUI_ASSOCIACOES");
      }
      throw error;
    }
  };

};

export default ClienteRepository