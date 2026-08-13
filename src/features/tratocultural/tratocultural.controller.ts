import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import TratoCulturalService from './tratocultural.service';
import {
  AtualizarDescricaoDTO, BuscarTratoPorIdDTO, CadastrarTratoCulturalDTO,
  ConfirmarTratoCulturalDTO, EditarResponsaveisTratoDTO, ExcluirInsumosTratoDTO,
  ExcluirTransacoesTratoDTO, FinalizarTratoCulturalDTO, InserirInsumosTratoDTO, ListarTratoPorPropriedadeDTO, ListarTratoPorSafraDTO,
  ListarTratoPorTalhaoDTO
} from './tratocultural.dto';
import { TipoTrato } from './tratocultural.entity';

class TratoCulturalController {
  constructor(private readonly tratoCulturalService: TratoCulturalService) { }

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: CadastrarTratoCulturalDTO = req.body;
      const idUsuario = req.session.idUsuario!;

      switch (dto.idTipoTrato) {
        case 1: dto.tipoTrato = TipoTrato.ADUBACAO; break;
        case 2: dto.tipoTrato = TipoTrato.CAPINA; break;
        case 3: dto.tipoTrato = TipoTrato.DEFENSIVO; break;
        case 4: dto.tipoTrato = TipoTrato.PODA; break;
        case 5: dto.tipoTrato = TipoTrato.REPLANTIO; break;
      }

      await this.tratoCulturalService.cadastrar(dto, idUsuario);
      res.status(201).json({ mensagem: 'Trato Cultural cadastrado com sucesso' });
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao cadastrar trato cultural');
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

  public async finalizar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: FinalizarTratoCulturalDTO = { idTrato: Number(req.params.id), dataFim: new Date(req.body.dataFim) };
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
      const dataInicioStr = req.query.dataInicio as string | undefined;
      const dataFimStr = req.query.dataFim as string | undefined;
      const paginaStr = req.query.pagina as string | undefined;
      const limiteStr = req.query.limite as string | undefined;

      const dto: ListarTratoPorPropriedadeDTO = { 
        idPropriedade: Number(req.params.id),
        dataInicio: dataInicioStr ? new Date(dataInicioStr) : undefined,
        dataFim: dataFimStr ? new Date(dataFimStr) : undefined,
        pagina: paginaStr ? Number(paginaStr) : 1, 
        limite: limiteStr ? Number(limiteStr) : 25  
      };

      const resultado = await this.tratoCulturalService.listarTodosPropriedade(dto, req.session.idUsuario!);

      res.status(200).json(resultado);
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao listar tratos');
    }
  }

  public async listarTodosSafra(req: Request, res: Response) {
    try {
      const dto: ListarTratoPorSafraDTO = { idSafra: Number(req.params.idSafra), idPropriedade: Number(req.params.id) };
      const tratos = await this.tratoCulturalService.listarTodosSafra(dto, req.session.idUsuario!);
      res.status(200).json(tratos);
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao listar tratos');
    }
  }

  public async listarTodosTalhao(req: Request, res: Response) {
    try {
      const dto: ListarTratoPorTalhaoDTO = { idTalhao: Number(req.params.idTalhao), idPropriedade: Number(req.params.id) };
      const tratos = await this.tratoCulturalService.listarTodosTalhao(dto, req.session.idUsuario!);
      res.status(200).json(tratos);
    } catch (error: unknown) {
      this.handleError(res, error, 'Erro ao listar tratos');
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
        case 'PESSOA_NAO_ENCONTRADA':
          return res.status(404).json();
        case 'ACESSO_NEGADO':
          return res.status(401).json({ error: 'Acesso negado! Você não tem permissão para esta ação.' });
        case 'DATA_INICIO_ANTERIOR':
          return res.status(422).json({ error: 'A data de início deve ser maior que a data de início da safra correspondente.' });
        case 'DATA_FIM_ANTERIOR':
          return res.status(422).json({ error: 'A data de fim deve ser maior que a data de início.' });
      }

      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({ error: defaultMessage });
  }
}

export default TratoCulturalController;