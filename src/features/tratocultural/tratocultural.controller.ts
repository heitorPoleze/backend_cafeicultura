import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import TratoCulturalService from './tratocultural.service';
import {
    AlterarInicioTratoCulturalDTO,
  AtualizarDescricaoDTO, BuscarTratoPorIdDTO, CadastrarTratoCulturalDTO, 
  EditarResponsaveisTratoDTO, EditarTratoCulturalDTO, ExcluirInsumosTratoDTO, ExcluirTransacoesTratoDTO, 
  ExcluirTratoCulturalDTO, 
  FinalizarTratoCulturalDTO, InserirInsumosTratoDTO, ListarTratoPorPropriedadeDTO, 
  ListarTratoPorSafraDTO,ListarTratoPorTalhaoDTO,
  StatusTrato
} from './tratocultural.dto';
import { TipoTrato } from './tratocultural.entity';

class TratoCulturalController {
  constructor(private readonly tratoCulturalService: TratoCulturalService) { }
  
  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: CadastrarTratoCulturalDTO = req.body;
      await this.tratoCulturalService.cadastrar(dto, req.session.idUsuario!);
      res.status(201).json({ mensagem: 'Trato Cultural cadastrado com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao cadastrar trato cultural');
    }
  }

  public async editar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: EditarTratoCulturalDTO = {
        id: Number(req.params.id),
        ...req.body
      }
      res.status(201).json(await this.tratoCulturalService.editar(dto, req.session.idUsuario!));
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao editar trato cultural');
    }
  }

  public async atualizarDescricao(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: AtualizarDescricaoDTO = { idTrato: Number(req.params.id), descricao: req.body.descricao };
      await this.tratoCulturalService.atualizarDescricao(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: 'Descrição do trato cultural atualizada com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao atualizar trato cultural');
    }
  }

  public async buscarPorId(req: Request, res: Response) {
    try {
      const dto: BuscarTratoPorIdDTO = { idTrato: Number(req.params.id) };
      const trato = await this.tratoCulturalService.buscarPorId(dto, req.session.idUsuario!);
      res.status(200).json(trato);
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao buscar trato cultural');
    }
  }

  public async buscarTiposTratos(req: Request, res: Response) {
    try {
      const tipos = await this.tratoCulturalService.buscarTiposTratos();
      res.status(200).json(tipos);
    } catch (error: unknown) {
      return res.status(500).json({ error: 'Erro ao buscar tipos de tratos' });
    }
  }

  public async alterarInicio(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: AlterarInicioTratoCulturalDTO = { 
        idTrato: Number(req.params.id), 
        dataInicio: new Date(req.body.dataInicio) 
      };
      await this.tratoCulturalService.alterarInicioTrato(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: 'Data de início alterada com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao alterar trato cultural');
    }

    }
  public async finalizar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: FinalizarTratoCulturalDTO = 
      { idTrato: Number(req.params.id), 
        dataInicio: new Date(req.body.dataInicio),
        dataFim: new Date(req.body.dataFim) 
      };
      await this.tratoCulturalService.finalizarTrato(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: 'Trato Cultural finalizado com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao finalizar trato cultural');
    }
  }

  public async listarTodosPropriedade(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const filtroInicioStr = req.query.filtroInicio as string | undefined;
      const filtroFimStr = req.query.filtroFim as string | undefined;
      const paginaStr = req.query.pagina as string | undefined;
      const statusStr = req.query.status as string | undefined;

      const dto: ListarTratoPorPropriedadeDTO = { 
        idPropriedade: Number(req.params.id),
        filtroInicio: filtroInicioStr ? new Date(filtroInicioStr) : undefined,
        filtroFim: filtroFimStr ? new Date(filtroFimStr) : undefined,
        pagina: paginaStr ? Number(paginaStr) : undefined,
        status: statusStr as StatusTrato
      };
      const resultado = await this.tratoCulturalService.listarTodosPropriedade(dto, req.session.idUsuario!);
      
      res.status(200).json(resultado);
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao listar tratos culturais da propriedade.');
    }
  }

  public async listarTodosSafra(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const paginaStr = req.query.pagina as string | undefined;

      const dto: ListarTratoPorSafraDTO = { 
        idPropriedade: Number(req.params.id),
        idSafra: Number(req.params.idSafra),
        pagina: paginaStr ? Number(paginaStr) : undefined
      };

      const resultado = await this.tratoCulturalService.listarTodosSafra(dto, req.session.idUsuario!);
      res.status(200).json(resultado);
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao listar tratos da safra.');
    }
  }

  public async listarTodosTalhao(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const paginaStr = req.query.pagina as string | undefined;
      const statusStr = req.query.status as string | undefined;

      const dto: ListarTratoPorTalhaoDTO = { 
        idPropriedade: Number(req.params.id),
        idTalhao: Number(req.params.idTalhao),
        pagina: paginaStr ? Number(paginaStr) : undefined,
        status: statusStr as StatusTrato | undefined
      };

      const resultado = await this.tratoCulturalService.listarTodosTalhao(dto, req.session.idUsuario!);
      res.status(200).json(resultado);
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao listar tratos do talhão.');
    }
  }

  public async editarResponsaveis(req: Request, res: Response) {
    try {
      const dto: EditarResponsaveisTratoDTO = { idTrato: Number(req.params.id), responsaveisIds: req.body.responsaveisIds };
      await this.tratoCulturalService.editarResponsaveis(dto, req.session.idUsuario!);
      res.status(201).json({ mensagem: 'Responsáveis editados com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao inserir responsáveis');
    }
  }

  public async inserirInsumos(req: Request, res: Response) {
    try {
      const dto: InserirInsumosTratoDTO = { idTrato: Number(req.params.id), insumos: req.body.insumos };
      await this.tratoCulturalService.inserirInsumos(dto, req.session.idUsuario!);
      res.status(201).json({ mensagem: 'Novos insumos inseridos com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao inserir insumos');
    }
  }

  public async excluirTransacoes(req: Request, res: Response) {
    try {
      const dto: ExcluirTransacoesTratoDTO = { idTrato: Number(req.params.id), idTransacoes: req.body.idTransacoes };
      await this.tratoCulturalService.excluirTransacoes(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: 'Transações excluídas com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao excluir transações');
    }
  }

  public async excluirInsumos(req: Request, res: Response) {
    try {
      const dto: ExcluirInsumosTratoDTO = { idTrato: Number(req.params.id), idInsumos: req.body.idInsumos };
      await this.tratoCulturalService.excluirInsumos(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: 'Insumos excluídos com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao excluir insumos');
    }
  }

  public async excluir(req: Request, res: Response) {
    try {
      const dto: ExcluirTratoCulturalDTO = { 
        idTrato: Number(req.params.id) 
      };
      await this.tratoCulturalService.excluir(dto, req.session.idUsuario!);
      res.status(200).json({ mensagem: 'Trato Cultural excluído com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao excluir trato cultural');
    }
  }

  private handleError(res: Response, error: unknown, defaultMessage: string) {
    if (error instanceof Error) {
      const msg = error.message;

      switch (msg) {
        case 'SAFRA_NAO_ENCONTRADA':
          return res.status(404).json({ error: 'Safra não encontrada' });
        case 'PROPRIEDADE_NAO_ENCONTRADA':
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        case 'TALHAO_NAO_ENCONTRADO':
          return res.status(404).json({ error: 'Talhão não encontrado' });
        case 'RESPONSAVEL_NAO_ENCONTRADO':
          return res.status(404).json({ error: 'Responsável não encontrado' });
        case 'INSUMO_NAO_ENCONTRADO':
          return res.status(404).json({ error: 'Insumo não encontrado' });
        case 'TRATO_NAO_ENCONTRADO':
          return res.status(404).json({ error: 'Trato Cultural não encontrado' });
        case 'TRATOS_NAO_ENCONTRADOS':
          return res.status(404).json({ error: 'Nenhum trato encontrado' });
        case 'TIPOS_TRATOS_NAO_ENCONTRADOS':
          return res.status(404).json({ error: 'Nenhum tipo de trato encontrado' });
        case 'PESSOA_NAO_ENCONTRADA':
          return res.status(404).json({ error: 'Responsável ou Beneficiado não encontrado' });
        case 'ACESSO_NEGADO':
          return res.status(403).json({ error: 'Acesso negado! Você não tem permissão para esta ação' });
        case 'DATA_INICIO_ANTERIOR':
          return res.status(422).json({ error: 'A data de início deve ser maior que a data de início da safra correspondente' });
        case 'DATA_INICIO_SUPERIOR':
          return res.status(422).json({ error: 'A data de início deve ser menor que a data de fim' });
        case 'DATA_FIM_ANTERIOR':
          return res.status(422).json({ error: 'A data de fim deve ser maior que a data de início' });
        case 'DATA_FIM_SUPERIOR':
          return res.status(422).json({ error: 'A data de fim deve ser menor ou igual que a data atual' });
        case 'SAFRA_FECHADA':
          return res.status(422).json({ error: 'Não é possível excluir um trato cultural de uma safra fechada' });
        case 'TRATO_OUTRA_SAFRA':
          return res.status(422).json({ error: 'Não é possível excluir um trato cultural de uma safra diferente da atual' });
        case 'FORMA_NAO_ENCONTRADA':
          return res.status(422).json({ error: 'Forma de pagamento inválida' });
        case 'VALOR_INVALIDO':
          return res.status(422).json({ error: 'Valor da quantidade usada inválido' });
        case 'ESTOQUE_INSUFICIENTE':
          return res.status(422).json({ error: 'Estoque insuficiente' });
      }

      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({ error: defaultMessage });
  }
}

export default TratoCulturalController;