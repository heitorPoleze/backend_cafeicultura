import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import SafraService from './safra.service';
import { BuscarEventosPorModuloDTO, BuscarRelatorioFinanceiroDTO, BuscarTodosEventosDTO, BuscarTodosEventosTalhaoDTO, ObterCustoSafraDTO } from './safra.dto';

class SafraController {
    constructor(private readonly safraService: SafraService) {};

    public async cadastrar(req: Request, res: Response): Promise<Response | void> {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const dto = req.body;
      const idUsuario = req.session.idUsuario!;
      const idSafra = await this.safraService.cadastrar(dto, idUsuario);

      return res.status(201).json({
        mensagem: 'Safra cadastrada com sucesso',
        dados: { id: idSafra },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível cadastrar safra' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade da safra não encontrada' });
        } else if (error.message === 'DUAS_ATIVAS') {
          return res.status(422).json({ error: 'Propriedade possui duas safras ativas' });
        } else if (error.message === 'DATA_INICIO_FUTURA') {
          return res.status(422).json({ error: 'Data de inicio superior ao dia atual' });
        } else if (error.message === 'DATA_FIM_INFERIOR') {
          return res.status(422).json({ error: 'Data de fim inferior ao dia de início' });
        } else if (error.message === 'DATA_FIM_SUPERIOR') {
          return res.status(422).json({ error: 'Data de fim superior ao dia atual' });
        }
        return res.status(500).json({ error: 'Erro interno inesperado ao cadastrar safra' });
      };
    };
  };
  public async buscarAtivasPorPropriedade(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const idPropriedade = Number(req.params.idPropriedade);
      const idUsuario = req.session.idUsuario!;
      const safras = await this.safraService.buscarAtivasPorPropriedade(idPropriedade, idUsuario);
      res.status(200).json(safras);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível buscar safras' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        return res.status(500).json({ error: 'Erro interno inesperado ao buscar safras' });
      }
    };
  }
  public async buscarTodasPorPropriedade(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const idPropriedade = Number(req.params.idPropriedade);
      const idUsuario = req.session.idUsuario!;
      const safras = await this.safraService.buscarTodasSafrasPorPropriedade(idPropriedade, idUsuario);
      res.status(200).json(safras);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(403).json({ error: 'Acesso negado! Não foi possível buscar safras' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        return res.status(500).json({ error: 'Erro interno inesperado ao buscar safras' });
      }
    };
  }
  public async buscarPorId(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const id = Number(req.params.id);
      const idUsuario = req.session.idUsuario!;
      const safra = await this.safraService.buscarPorId(id, idUsuario);
      res.status(200).json(safra);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível buscar safra' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Safra nao encontrada' });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade da safra não encontrada' });
        };
        return res.status(500).json({ error: 'Erro interno inesperado ao buscar safra' });
      };
    };
  };

  public async finalizar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const id = Number(req.params.id);
      const dataFim = new Date(req.body.dataFim);
      const dto = { id, dataFim };
      const idUsuario = req.session.idUsuario!;
      await this.safraService.finalizar(dto, idUsuario);
      res.status(200).json({mensagem: 'Safra finalizada com sucesso'});
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível finalizar safra' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Safra não encontrada' });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade da safra não encontrada' });
        } else if (error.message === 'DATA_FIM_SUPERIOR') {
          return res.status(422).json({ error: 'Data fim superior ao dia atual' });
        } else if (error.message === 'DATA_FIM_ANTERIOR') {
          return res.status(422).json({ error: 'Data fim anterior a data inicio' });
        }
        return res.status(500).json({ error: 'Erro interno inesperado ao finalizar safra' });
      };
    };
  };

  public async excluir(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const id = Number(req.params.id);
      const idUsuario = req.session.idUsuario!;
      await this.safraService.excluir({id}, idUsuario);
      res.status(200).json({mensagem: 'Safra excluida com sucesso!'});
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível excluir safra' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Safra não encontrada' });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade da safra não encontrada' });
        } else if (error.message === 'SAFRA_POSSUI_EVENTOS') {
          return res.status(400).json({ error: 'Safra possui eventos vinculados e não pode ser excluída' });
        }
        return res.status(500).json({ error: 'Erro interno inesperado ao excluir safra' });
      };
    };
  };

  // ---- Relatórios -----


  public async custoAtualSafra(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: ObterCustoSafraDTO = {
        idPropriedade: Number(req.params.id),
        idSafra: Number(req.params.idSafra)
      };
      
      const resultado = await this.safraService.obterCustoSafra(dto, req.session.idUsuario!);
      
      res.status(200).json(resultado);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Safra não encontrada' });
        }
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(403).json({ error: 'Acesso negado à propriedade' });
        }
        if (error.message === 'SAFRA_NAO_PERTENCE_PROPRIEDADE') {
          return res.status(400).json({ error: 'A safra informada não pertence a esta propriedade' });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao buscar custo da safra para o dashboard' });
    }
  }

  public async relatorioFinanceiro(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: BuscarRelatorioFinanceiroDTO = {
        idPropriedade: Number(req.params.id),
        idSafra: Number(req.params.idSafra)
      };
      
      const relatorio = await this.safraService.gerarRelatorioFinanceiro(dto, req.session.idUsuario!);
      
      res.status(200).json(relatorio);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'SEM_TRANSACOES') {
          return res.status(404).json({ error: 'Safra não possui transações' });
        }
        if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Safra não encontrada' });
        }
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(403).json({ error: 'Acesso negado à propriedade' });
        }
        if (error.message === 'SAFRA_NAO_PERTENCE_PROPRIEDADE') {
          return res.status(403).json({ error: 'A safra informada não pertence a esta propriedade' });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao gerar o relatório financeiro' });
    }
  }
  
  public async relatorioEventosSafra(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: BuscarTodosEventosDTO = {
        idPropriedade: Number(req.params.id),
        idSafra: Number(req.params.idSafra)
      };
      const eventos = await this.safraService.listarTodosEventos(dto, req.session.idUsuario!);
      
      res.status(200).json(eventos);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'SEM_EVENTOS') {
          return res.status(404).json({ error: 'Safra não possui eventos' });
        }
        if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Safra não encontrada' });
        };
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        };
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(403).json({ error: 'Acesso negado à propriedade' });
        };
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao gerar relatório de eventos' });
    }
  }

  public async listarEventosPorModulo(req: Request, res: Response) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const dto: BuscarEventosPorModuloDTO = {
      idPropriedade: Number(req.params.id),
      idSafra: Number(req.params.idSafra),
      modulo: String(req.params.modulo)
    };
    
    const eventos = await this.safraService.listarEventosPorModulo(dto, req.session.idUsuario!);
    
    res.status(200).json(eventos);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'NAO_ENCONTRADA') {
        return res.status(404).json({ error: 'Safra não encontrada' });
      }
      if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
        return res.status(404).json({ error: 'Propriedade não encontrada' });
      }
      if (error.message === 'ACESSO_NEGADO') {
        return res.status(401).json({ error: 'Acesso negado à propriedade' });
      }
      if (error.message === 'MODULO_EVENTO_INVALIDO') {
        return res.status(400).json({ error: 'O tipo de evento informado é inválido ou ainda não está disponível' });
      }
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erro interno ao buscar eventos por tipo.' });
  }
}
public async reativarSafra(req: Request, res: Response) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const id = Number(req.params.id);
    const safraReativada = await this.safraService.reativarSafra(id); 
    return res.status(200).json(safraReativada);
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'ACESSO_NEGADO') {
        return res.status(403).json({ error: 'Acesso negado! Não foi possível reativar safra' });
      } else if (error.message === 'NAO_ENCONTRADA') {
        return res.status(404).json({ error: 'Safra não encontrada' });
      } else if (error.message === 'NAO_REATIVADA') {
        return res.status(422).json({ error: 'Não foi possível concluir a reativação da safra' });
      }
    }
    return res.status(500).json({ error: 'Erro interno inesperado ao reativar safra' });
  }
}
  public async relatorioEventosTalhao(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: BuscarTodosEventosTalhaoDTO = {
        idPropriedade: Number(req.params.id),
        idSafra: Number(req.params.idSafra),
        idTalhao: Number(req.params.idTalhao)
      };
      
      const eventos = await this.safraService.listarTodosEventosTalhao(dto, req.session.idUsuario!);
      
      res.status(200).json(eventos);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'SEM_EVENTOS') {
          return res.status(404).json({ error: 'Talhão da safra não possui eventos' });
        }
        if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Safra não encontrada' });
        }
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') { 
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(403).json({ error: 'Acesso negado à propriedade' });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao buscar eventos do talhão' });
    }
  }
}
export default SafraController;