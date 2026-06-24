import { Request, Response } from "express";
import { validationResult } from "express-validator";
import PessoaService from "./pessoa.service";
import { ClienteResponseDTO } from "./pessoa.dto";

class PessoaController {
  constructor(private service: PessoaService) {}

  public async cadastrarCliente(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };
    try {
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
    };
    try {
      await this.service.cadastrarFornecedor(req.body);

      res.status(201).json({ mensagem: "Fornecedor cadastrado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(409).json({ error: "CPF já cadastrado" });
        };
        return res.status(500).json({ error: error.message });
      };
    };
  };

  public async cadastrarFuncionario(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };
    try {
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

      await this.service.atualizarFuncionarioSalario({
        id: Number(req.params.id),
        salario: req.body.salario,
      });
    
      res.status(200).json({ mensagem: "Salário atualizado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Funcionário não encontrado" });
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
      await this.service.cadastrarMeeiro(req.body);

      res.status(201).json({ mensagem: "Meeiro cadastrado com sucesso" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "CPF_EXISTENTE") {
          return res.status(409).json({ error: "CPF já cadastrado" });
        };
        return res.status(500).json({ error: error.message });
      };
    };
  };

  public async cadastrarPrestador(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };
    try {
      await this.service.cadastrarPrestador(req.body);

      res.status(201).json({ mensagem: "Prestador de Serviço cadastrado com sucesso" });
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
      const cliente = await this.service.buscarClientePorId(Number(req.params.id));
      res.status(200).json(cliente);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Cliente não encontrado" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar cliente" });
        };
      }
    };
  };

  public async buscarFornecedorPorId(req: Request, res: Response) {
    try {
      const fornecedor = await this.service.buscarFornecedorPorId(Number(req.params.id));
      res.status(200).json(fornecedor);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Fornecedor não encontrado" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar fornecedor" });
        };
      }
    };
  };

  public async buscarFuncionarioPorId(req: Request, res: Response) {
    try {
      const funcionario = await this.service.buscarFuncionarioPorId(Number(req.params.id));
      res.status(200).json(funcionario);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Funcionário não encontrado" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar funcionário" });
        };
      }
    };
  };

  public async buscarMeeiroPorId(req: Request, res: Response) {
    try {
      const meeiro = await this.service.buscarMeeiroPorId(Number(req.params.id));
      res.status(200).json(meeiro);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Meeiro não encontrado" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar meeiro" });
        };
      };
    };
  };

  public async buscarPrestadorPorId(req: Request, res: Response) {
    try {
      const prestador = await this.service.buscarPrestadorPorId(Number(req.params.id));
      res.status(200).json(prestador);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "NAO_ENCONTRADO") {
          return res.status(404).json({ error: "Prestador de Serviço não encontrado" });
        } else if (error.message === "ERRO_AO_BUSCAR") {
          return res.status(500).json({ error: "Erro ao buscar prestador de serviço" });
        };
      };
    };
  };
};

export default PessoaController;