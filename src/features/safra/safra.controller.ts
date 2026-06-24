import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import SafraService from './safra.service';

class SafraController {
    constructor(private readonly safraService: SafraService) {};

    public async cadastrar(req: Request, res: Response): Promise<Response | void> {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const dto = req.body;
      const idUsuario = req.session.idUsuario!
      await this.safraService.cadastrar(dto, idUsuario);
      
      res.status(201).json({mensagem: 'Safra cadastrada com sucesso!'});
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível cadastrar safra' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade da safra não encontrada' });
        } else if (error.message === 'DUAS_ATIVAS') {
          return res.status(403).json({ error: 'Propriedade possui duas safra ativas' });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro interno inesperado ao cadastrar talhão.' });
    };
  };

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
          return res.status(403).json({ error: 'Propriedade da safra não encontrada' });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro interno inesperado ao buscar safra' });
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
      res.status(200).json({mensagem: 'Safra finalizada com sucesso!'});
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível finalizar safra' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Safra não encontrada' });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(403).json({ error: 'Propriedade da safra não encontrada' });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro interno inesperado ao finalizar safra' });
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
          return res.status(403).json({ error: 'Propriedade da safra não encontrada' });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro interno inesperado ao excluir safra' });
    };
  };
}
export default SafraController;