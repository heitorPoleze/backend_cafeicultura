import { Prisma, PrismaClient } from "@prisma/client";
import Cliente from './cliente.entity';
import PessoaRepository from "../pessoa.repository";
import Endereco from "../../endereco/endereco.vo";
import PessoaFactory from "../pessoafactory.entity";

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

  public async buscarPorId(id: number): Promise<Cliente | null> {
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
      ? new Endereco(e.logradouro, e.bairro, e.cidade, e.uf, e.pais, e.cep, e.idEndereco_PK)
      : null;

    const tipoPessoa = p.pessoasfisicas ? 'fisica' : 'juridica';

    const dados = {
      id: c.idCliente_PFK, 
      dataCadastro: p.dataCadastro,
      endereco: endereco,
      nome: p.pessoasfisicas?.nome,
      cpf: p.pessoasfisicas?.cpf,
      razaoSocial: p.pessoasjuridicas?.razaoSocial,
      cnpj: p.pessoasjuridicas?.cnpj,
      inscEstadual: p.pessoasjuridicas?.inscEstadual
    };

    // 4. Delega a criação para a Factory
    const pessoa = PessoaFactory.criarPessoa(tipoPessoa, dados);

    return new Cliente(pessoa);
  };
};

export default ClienteRepository