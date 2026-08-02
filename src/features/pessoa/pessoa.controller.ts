import { Request, Response } from "express";
import { validationResult } from "express-validator";
import PessoaService from "./pessoa.service";
import Endereco from "../../shared/domain/endereco/endereco.vo";
import { ExcluirPessoaDTO } from "./pessoa.dto";


class PessoaController {
  constructor(private service: PessoaService) { }

  public async cadastrarCliente(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      req.body.idAdministrador = req.session.idUsuario!;
      await this.service.cadastrarCliente(req.body);

      res.status(201).json({ mensagem: "Cliente cadastrado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(409).json({ error: "CPF já cadastrado" });
        } else if (error.message === "CNPJ_EXISTENTE") {
          return res.status(409).json({ error: "CNPJ já cadastrado" });
        };
        return res.status(500).json({ error: error.message });
      };
    };
  };

  public async cadastrarFornecedor(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      req.body.idAdministrador = req.session.idUsuario!;
      await this.service.cadastrarFornecedor(req.body);

      res.status(201).json({ mensagem: "Fornecedor cadastrado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(409).json({ error: "CPF já cadastrado" });
        }
        return res.status(500).json({ error: error.message });
      };
    }
  };

  public async cadastrarFuncionario(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };
    try {
      req.body.idAdministrador = req.session.idUsuario!;
      await this.service.cadastrarFuncionario(req.body);

      res.status(201).json({ mensagem: "Funcionário cadastrado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(409).json({ error: "CPF já cadastrado" });
        };
        return res.status(500).json({ error: error.message });
      };
    };
  };

  public async atualizarFuncionarioSalario(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };
    try {
      await this.service.atualizarFuncionarioSalario(
        {
          id: Number(req.params.id),
          salario: req.body.salario,
        },
        req.session.idUsuario!,
      );

      res.status(200).json({ mensagem: "Salário atualizado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Funcionário não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode atualizar salário" });
        } else if (error.message === "NAO_ATUALIZADO") {
          return res.status(500).json({ error: "Erro ao atualizar salário" });
        };
      };
    };
  };

  public async cadastrarMeeiro(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };
    try {
      req.body.idAdministrador = req.session.idUsuario!;
      await this.service.cadastrarMeeiro(req.body);

      res.status(201).json({ mensagem: "Meeiro cadastrado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(409).json({ error: "CPF já cadastrado" });
        }
        return res.status(500).json({ error: error.message });
      };
    };
  };

  public async cadastrarPrestador(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      req.body.idAdministrador = req.session.idUsuario!;
      await this.service.cadastrarPrestador(req.body);

      res
        .status(201)
        .json({ mensagem: "Prestador de Serviço cadastrado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(409).json({ error: "CPF já cadastrado" });
        };
        return res.status(500).json({ error: error.message });
      };
    };
  };

  public async buscarClientePorId(req: Request, res: Response) {
    try {
      const cliente = await this.service.buscarClientePorId(
        Number(req.params.id),
        req.session.idUsuario!,
      );
      res.status(200).json(cliente);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Cliente não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar cliente" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar cliente" });
        };
      };
    };
  };

  public async buscarFornecedorPorId(req: Request, res: Response) {
    try {
      const fornecedor = await this.service.buscarFornecedorPorId(
        Number(req.params.id),
        req.session.idUsuario!,
      );
      res.status(200).json(fornecedor);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Fornecedor não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar fornecedor" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar fornecedor" });
        };
      };
    };
  };

  public async buscarFuncionarioPorId(req: Request, res: Response) {
    try {
      const funcionario = await this.service.buscarFuncionarioPorId(
        Number(req.params.id),
        req.session.idUsuario!,
      );
      res.status(200).json(funcionario);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Funcionário não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar funcionário" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar funcionário" });
        };
      };
    };
  };

  public async buscarFuncionarioPorIdAdministrador(req: Request, res: Response) {
    const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    try {
      const funcionarios = await this.service.buscarFuncionariosPorIdAdministrador(
        req.session.idUsuario!,
        pagina,
        limite
      );
      res.status(200).json(funcionarios);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Funcionário não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar funcionário" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar funcionário" });
        };
      };
    };
  };
  public async buscarClientesPorIdAdministrador(req: Request, res: Response) {
    const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    try {
      const clientes = await this.service.buscarClientesPorIdAdministrador(
        req.session.idUsuario!,
        pagina,
        limite
      );
      res.status(200).json(clientes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Cliente não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar cliente" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar cliente" });
        };
      }
    };
  };

  public async buscarMeeirosPorIdAdministrador(req: Request, res: Response) {
    const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    try {
      const meeiros = await this.service.buscarMeeirosPorIdAdministrador(
        req.session.idUsuario!,
        pagina,
        limite
      );
      res.status(200).json(meeiros);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Meeiro não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar meeiro" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar meeiro" });
        };
      }
    };
  };

  public async buscarPrestadoresDeServicoPorIdAdministrador(req: Request, res: Response) {
    const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    try {
      const meeiros = await this.service.buscarPrestadoresDeServicoPorIdAdministrador(
        req.session.idUsuario!,
        pagina,
        limite

      );
      res.status(200).json(meeiros);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Prestador de Serviço não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar prestador de serviço" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar prestador de serviço" });
        };
      }
    };
  };

  public async buscarFornecedoresPorIdAdministrador(req: Request, res: Response) {
    const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    try {
      const fornecedores = await this.service.buscarFornecedoresPorIdAdministrador(
        req.session.idUsuario!,
        pagina,
        limite
      );
      res.status(200).json(fornecedores);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Fornecedor não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar fornecedor" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar fornecedor" });
        };
      }
    };
  };

  public async buscarMeeiroPorId(req: Request, res: Response) {
    try {
      const meeiro = await this.service.buscarMeeiroPorId(
        Number(req.params.id),
        req.session.idUsuario!,
      );
      res.status(200).json(meeiro);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Meeiro não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode visualizar meeiro" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar meeiro" });
        };
      };
    };
  };

  public async buscarPrestadorPorId(req: Request, res: Response) {
    try {
      const prestador = await this.service.buscarPrestadorPorId(
        Number(req.params.id),
        req.session.idUsuario!,
      );
      res.status(200).json(prestador);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res
            .status(404)
            .json({ error: "Prestador de Serviço não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({
              error: "Acesso negado! Não pode visualizar prestador de serviço",
            });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res
            .status(500)
            .json({ error: "Erro ao buscar prestador de serviço" });
        };
      };
    };
  };

  public async listarPessoas(req: Request, res: Response) {
    try {
      const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
      const limite = req.query.limite ? Number(req.query.limite) : 10;

      const pessoas = await this.service.listarPessoas({
        idAdministrador: req.session.idUsuario!,
        pagina,
        limite,
      });

      res.status(200).json(pessoas);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "SEM_REGISTROS") {
          return res.status(200).json({ error: "Nenhuma pessoa cadastrada a esse ID ou Página Vazia.", data: [] });
        }
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro ao listar pessoas" });
    }
  }

  public async cadastrarEnderecoPessoaGenerica(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      await this.service.cadastrarEnderecoPessoaGenerica(
        Number(req.params.id),
        new Endereco(
          req.body.cidade,
          req.body.bairro,
          req.body.cep,
          req.body.uf,
          req.body.pais,
          req.body.logradouro,
          req.body.idEndereco

        )
      );
      res.status(201).json({ message: "Endereço cadastrado com sucesso", endereco: req.body });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Pessoa não encontrada" });
        }
        return res.status(400).json({ error: error.message });
      };
      res.status(500).json({ error: "Erro ao cadastrar endereço" });
    };
  };

  public async atualizarEnderecoPessoaGenerica(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      await this.service.atualizarEnderecoPessoaGenerica(
        Number(req.params.id),
        new Endereco(
          req.body.cidade,
          req.body.bairro,
          req.body.cep,
          req.body.uf,
          req.body.pais,
          req.body.logradouro,
          req.body.idEndereco
        )
      );
      res.status(200).json({ message: "Endereço atualizado com sucesso", endereco: req.body });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Pessoa não encontrada" });
        }
        return res.status(400).json({ error: error.message });
      };
      res.status(500).json({ error: "Erro ao atualizar endereço" });
    };
  };

  public async RemoverEnderecoPessoaGenerica(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      let response = await this.service.removerEnderecoPessoaGenerica(
        Number(req.params.id)
      );
      res.status(200).json({ message: "Endereço removido com sucesso", response });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Pessoa ou endereço não encontrado" });
        }
        return res.status(400).json({ error: error.message });
      };
      res.status(500).json({ error: "Erro ao remover endereço" });
    }
  };
  public async AtualizarNomeOuRazaoSocial(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() })
    } try {
      const pessoaId = Number(req.params.id);
      await this.service.atualizarNomeOuRazaoSocial(req.body, pessoaId);
      res.status(200).json({ mensagem: "Nome ou Razão Social atualizadas com sucesso.", novaInformacao: req.body });
    } catch (error: unknown) {
      res.status(500).json({ mensagem: (error as Error).message })
    }
  }
  public async atualizarCpf(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() })
    } try {
      const pessoaId = Number(req.params.id);
      const cpf = req.body.cpf
      let resposta = await this.service.atualizarCpf(cpf, pessoaId);
      res.status(200).json({ mensagem: "CPF Atualizado com sucesso.", resposta });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(404).json({ error: "CPF já cadastrado no sistema." });
        }
      }
      res.status(500).json({ error: "Erro ao atualizar CPF." });
    }
  }
  public async atualizarCpnj(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() })
    } try {
      const pessoaId = Number(req.params.id)
      const cnpj = req.body.cnpj
      let resposta = await this.service.atualizarCNPJ(cnpj, pessoaId)
      return res.status(200).json({ mensagem: "CNPJ atualizado com sucesso.", resposta })
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CNPJ_EXISTENTE") {
          return res.status(404).json({ error: "CNPJ já cadastrado no sistema." });
        }
        if (error.message === "CNPJ_INVALIDO") {
          return res.status(404).json({ error: "CNPJ em formato inválido." });
        }
        res.status(500).json({ error: "Erro ao atualizar CNPJ." })
      }
    }
  }
  public async atualizarInscricaoEstadual(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() })
    } try {
      const pessoaId = Number(req.params.id)
      const novaIE = req.body.inscricaoEstadual
      let resposta = await this.service.atualizarInscricaoEstadual(novaIE, pessoaId)
      return res.status(200).json({ mensagem: "Inscrição Estadual atualizada com sucesso.", resposta })
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "INSCRICAO_INVALIDA") {
          return res.status(400).json({ error: "Inscrição estadual inválida." })
        }
      }
      res.status(500).json({ error: "Erro ao atualizar Inscrição Estadual." })
    }
  }

  public async excluirCliente(req: Request, res: Response) {
    try {
      const dto: ExcluirPessoaDTO = { id: Number(req.params.id) };
      await this.service.excluirCliente(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Cliente excluído com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Cliente não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode excluir cliente" });
        } else if (error.message === "CLIENTE_POSSUI_ASSOCIACOES") {
          return res.status(400).json({ error: "Cliente possui associações e não pode ser excluído" });
        } else if (error.message === "ERRO_AO_EXCLUIR") {
          return res.status(500).json({ error: "Erro ao excluir cliente" });
        };
      };
    };
  };

  public async excluirFornecedor(req: Request, res: Response) {
    try {
      const dto: ExcluirPessoaDTO = { id: Number(req.params.id) };
      await this.service.excluirFornecedor(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Fornecedor excluído com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Fornecedor não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode excluir fornecedor" });
        } else if (error.message === "FORNECEDOR_POSSUI_ASSOCIACOES") {
          return res.status(403).json({ error: "Fornecedor possui associações e não pode ser excluído" });
        } else if (error.message === "ERRO_AO_EXCLUIR") {
          return res.status(500).json({ error: "Erro ao excluir fornecedor" });
        };
      };
    };
  };

  public async excluirFuncionario(req: Request, res: Response) {
    try {
      const dto: ExcluirPessoaDTO = { id: Number(req.params.id) };
      await this.service.excluirFuncionario(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Funcionário excluído com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Funcionário não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode excluir funcionário" });
        } else if (error.message === "FUNCIONARIO_POSSUI_ASSOCIACOES") {
          return res.status(403).json({ error: "Funcionário possui associações e não pode ser excluído" });
        } else if (error.message === "ERRO_AO_EXCLUIR") {
          return res.status(500).json({ error: "Erro ao excluir funcionário" });
        };
      };
    };
  };

  public async excluirMeeiro(req: Request, res: Response) {
    try {
      const dto: ExcluirPessoaDTO = { id: Number(req.params.id) };
      await this.service.excluirMeeiro(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Meeiro excluído com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Meeiro não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode excluir meeiro" });
        } else if (error.message === "MEEIRO_POSSUI_ASSOCIACOES") {
          return res.status(403).json({ error: "Meeiro possui associações e não pode ser excluído" });
        } else if (error.message === "ERRO_AO_EXCLUIR") {
          return res.status(500).json({ error: "Erro ao excluir meeiro" });
        };
      };
    };
  };

  public async excluirPrestador(req: Request, res: Response) {
    try {
      const dto: ExcluirPessoaDTO = { id: Number(req.params.id) };
      await this.service.excluirPrestador(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: "Prestador de Serviço excluído com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Prestador de Serviço não encontrado" });
        } else if (error.message === "ACESSO_NEGADO") {
          return res
            .status(403)
            .json({ error: "Acesso negado! Não pode excluir prestador de serviço" });
        } else if (error.message === "PRESTADOR_POSSUI_ASSOCIACOES") {
          return res.status(403).json({ error: "Prestador de Serviço possui associações e não pode ser excluído" });
        }
      };
    };
  };
};

export default PessoaController;