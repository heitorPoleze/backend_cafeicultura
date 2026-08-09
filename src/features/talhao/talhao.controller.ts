import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import TalhaoService from './talhao.service';
import { CadastrarTalhaoDTO } from './talhao.dto';

export class TalhaoController {
  constructor(private readonly talhaoService: TalhaoService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const dto: CadastrarTalhaoDTO = req.body;
      const idUsuario = req.session.idUsuario!;
      const idTalhao = await this.talhaoService.cadastrarTalhao(dto, idUsuario);

      return res.status(201).json({
        mensagem: 'Talhão cadastrado com sucesso',
        dados: { id: idTalhao },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'NOME_DUPLICADO') {
          return res.status(409).json({ error: 'Nome de talhão já existe para um ativo' });
        } else if (error.message === 'NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        } else if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível cadastrar talhão' });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao cadastrar talhão' });
    };
  };

  public async buscarVariedades(req: Request, res: Response) {
    try {
      const variedades = await this.talhaoService.buscarVariedades();
      res.status(200).json(variedades);
    } catch (error: unknown) {
      if(error instanceof Error) {
        return res.status(500).json({ error: 'Erro ao buscar variedades' });      
      };
    };
  };  

  public async encerrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };

    try {
      const id = Number(req.params.id);
      const dataFim = new Date(req.body.dataFim);
      const idUsuario = req.session.idUsuario!;

      const dto = { id, dataFim };
      await this.talhaoService.encerrarTalhao(dto, idUsuario);

      res.status(200).json({ 
        message: 'Talhão encerrado com sucesso' 
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível encerrar talhão' });
        } else if (error.message === 'NAO_ENCONTRADO') {
          return res.status(404).json({ error: 'Talhão nao encontrado' });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(403).json({ error: 'Propriedade do talhão não encontrada' });
        }
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao encerrar talhão' });
    };
  };

  public async excluir(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };
    try {
      const id = Number(req.params.id);
      const idUsuario = req.session.idUsuario!;
      await this.talhaoService.excluir({id}, idUsuario);
      res.status(200).json({ message: 'Talhão excluído com sucesso' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível excluir talhão' });
        } else if (error.message === 'NAO_ENCONTRADO') {
          return res.status(404).json({ error: 'Talhão nao encontrado' });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade do talhão não encontrada' });
        } else if (error.message === 'TALHAO_POSSUI_EVENTOS') {
          return res.status(403).json({ error: 'Talhão não pode ser excluído pois possui eventos associados' });
        }
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao excluir talhão' });
    };
  };  

  public async abertosPorPropriedade(req: Request, res: Response) {
    const erros = validationResult(req);
    const idPropriedade = Number(req.params.idPropriedade);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const talhoes = await this.talhaoService.buscarAbertosPorPropriedade(idPropriedade);
      res.status(200).json(talhoes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: 'Erro ao buscar talhões abertos' });
      }
    }
  }

  public async allTalhoesPorPropriedade(req: Request, res: Response) {
      const erros = validationResult(req);
      const idPropriedade = Number(req.params.idPropriedade);
      const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
      const limite = req.query.limite ? Number(req.query.limite) : 10;
      if(!erros.isEmpty()){
        return res.status(400).json({ erros: erros.array() });
      }
      try {
        const talhoes = await this.talhaoService.buscarTodosPorPropriedade(idPropriedade, pagina, limite);
        res.status(200).json(talhoes);
      } catch (error: unknown) {
        if (error instanceof Error) {
          return res.status(500).json({ error: 'Erro ao buscar todos os talhões' });
        }
      }
  }

  public async finalizadosPorPropriedade(req: Request, res: Response) {
    const erros = validationResult(req);
    const idPropriedade = Number(req.params.idPropriedade);
    const pagina = req.query.pagina ? Number(req.query.pagina) : 1;
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const talhoes = await this.talhaoService.buscarFinalizadosPorPropriedade(idPropriedade, pagina, limite);
      res.status(200).json(talhoes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: 'Erro ao buscar talhões finalizados' });
      }
    }
  }

}

export default TalhaoController;