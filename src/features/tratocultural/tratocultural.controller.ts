import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import TratoCulturalService from './tratocultural.service';
import { BuscarTratoPorIdDTO, CadastrarTratoCulturalDTO, ConfirmarTratoCulturalDTO, FinalizarTratoCulturalDTO, ListarTratoPorPropriedadeDTO, ListarTratoPorSafraDTO, ListarTratoPorTalhaoDTO } from './tratocultural.dto';
import { TipoTrato } from './tratocultural.entity';

export class TratoCulturalController {
  constructor(private readonly tratoCulturalService: TratoCulturalService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };

    try {
      const dto: CadastrarTratoCulturalDTO = req.body;
      const idUsuario = req.session.idUsuario!; 

      switch (dto.idTipoTrato) {
        case 1:
          dto.tipoTrato = TipoTrato.ADUBACAO;
        case 2:
          dto.tipoTrato = TipoTrato.CAPINA;
        case 3:
          dto.tipoTrato = TipoTrato.DEFENSIVO;
        case 4:
          dto.tipoTrato = TipoTrato.PODA;
        case 5:
          dto.tipoTrato = TipoTrato.REPLANTIO;
      };

      await this.tratoCulturalService.cadastrar(dto, idUsuario);
      
      res.status(201).json({mensagem: 'Trato Cultural cadastrado com sucesso'});
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (
            error.message === 'SAFRA_NAO_ENCONTRADA'
        ) {
          return res.status(404).json({ error: "Safra não encontrada" });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
            return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === 'TALHAO_NAO_ENCONTRADO') {
            return res.status(404).json({ error: "Talhão não encontrado" });
        } else if (error.message === 'RESPONSAVEL_NAO_ENCONTRADO') {
            return res.status(404).json({ error: "Um dos responsáveis não foi encontrado" });
        } else if (error.message === 'INSUMO_NAO_ENCONTRADO') {
            return res.status(404).json({ error: "Insumo não encontrado" });
        } else if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Não foi possível cadastrar o trato cultural' });
        } else if (error.message === 'TIPO_TRATO_INVALIDO') {
          return res.status(400).json({ error: 'Tipo de trato cultural inválido' });
        } else if (error.message === 'DATA_INICIO_ANTERIOR') {
          return res.status(422).json({ error: 'A data de início deve ser maior que a data de início da safra que ele pertence' });
        } else if (error.message === 'DATA_FIM_ANTERIOR') {
          return res.status(422).json({ error: 'A data de fim deve ser maior que a data de início do trato cultural' });
        };
        return res.status(400).json({ error: error.message });
      };
        return res.status(500).json({ error: 'Erro ao cadastrar trato cultural' });
    };
  };

  public async buscarPorId(req: Request, res: Response) {
    try {
      const dto: BuscarTratoPorIdDTO = {
        idTrato: Number(req.params.id)
      };
      const idUsuario = req.session.idUsuario!;
      const trato = await this.tratoCulturalService.buscarPorId(dto, idUsuario);
      res.status(200).json(trato);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TRATO_NAO_ENCONTRADO') {
            return res.status(404).json({ error: "Trato Cultural não encontrado" });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
            return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === 'ACESSO_NEGADO') {
            return res.status(401).json({ error: 'Acesso negado! Não foi possível buscar o trato cultural' });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao buscar trato cultural' });
    };
  };

  public async buscarTiposTratos(req: Request, res: Response) {
    try {
      const tipos = await this.tratoCulturalService.buscarTiposTratos();
      res.status(200).json(tipos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tipos de tratos' });
    };
  };

  public async finalizar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };

    try {
      const idUsuario = req.session.idUsuario!;
      const dto: FinalizarTratoCulturalDTO = {
          idTrato: Number(req.params.id),
          dataFim: new Date(req.body.dataFim)
      };

      await this.tratoCulturalService.finalizarTrato(dto, idUsuario);

      res.status(200).json({ mensagem: 'Trato Cultural recebeu uma data de fim com sucesso' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'TRATO_NAO_ENCONTRADO') {
            return res.status(404).json({ error: "Trato Cultural não encontrado" });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
            return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === 'ACESSO_NEGADO') {
            return res.status(401).json({ error: 'Acesso negado! Não foi possível finalizar o trato cultural' });
        } else if (error.message === 'DATA_FIM_ANTERIOR') {
          return res.status(422).json({ error: 'A data de fim deve ser maior que a data de início' });
        }
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao finalizar trato cultural' });
    };
  };

  public async confirmar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    try {
      const idUsuario = req.session.idUsuario!;
      const dto: ConfirmarTratoCulturalDTO = {
          idTrato: Number(req.params.id)
      };

      await this.tratoCulturalService.confirmarTrato(dto, idUsuario);

      res.status(200).json({ mensagem: 'Trato Cultural confirmado com sucesso' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'TRATO_NAO_ENCONTRADO') {
            return res.status(404).json({ error: "Trato Cultural não encontrado" });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
            return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === 'ACESSO_NEGADO') {
            return res.status(401).json({ error: 'Acesso negado! Não foi possível confirmar o trato cultural' });
        };
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao confirmar trato cultural' });
    };
  };

  public async listarTodosPropriedade(req: Request, res: Response) {
    try {
      const dto: ListarTratoPorPropriedadeDTO = {
        idPropriedade: Number(req.params.id)
      };
      const idUsuario = req.session.idUsuario!;
      const tratos = await this.tratoCulturalService.listarTodosPropriedade(dto, idUsuario);
      res.status(200).json(tratos);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
            return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === 'ACESSO_NEGADO') {
            return res.status(401).json({ error: 'Acesso negado! Não foi possível listar os tratos culturais' });
        } else if (error.message === 'TRATOS_NAO_ENCONTRADOS') {
            return res.status(404).json({ error: "Sem tratos culturais cadastrados para esta propriedade" });
        }
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao listar tratos' });
    };
  };

  public async listarTodosSafra(req: Request, res: Response) {
    try {
      const dto: ListarTratoPorSafraDTO = {
        idSafra: Number(req.params.idSafra),
        idPropriedade: Number(req.params.id)
      };
      const idUsuario = req.session.idUsuario!;
      const tratos = await this.tratoCulturalService.listarTodosSafra(dto, idUsuario);
      res.status(200).json(tratos);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'SAFRA_NAO_ENCONTRADA') {
            return res.status(404).json({ error: "Safra não encontrada" });
        } else if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
            return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === 'ACESSO_NEGADO') {
            return res.status(401).json({ error: 'Acesso negado! Não foi possível listar os tratos culturais' });
        } else if (error.message === 'TRATOS_NAO_ENCONTRADOS') {
            return res.status(404).json({ error: "Sem tratos culturais cadastrados esta safra" });
        }
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao listar tratos' });
    };
  };

  public async listarTodosTalhao(req: Request, res: Response) {
    try {
      const dto: ListarTratoPorTalhaoDTO = {
        idTalhao: Number(req.params.idTalhao),
        idPropriedade: Number(req.params.id),
      };
      const idUsuario = req.session.idUsuario!;
      const tratos = await this.tratoCulturalService.listarTodosTalhao(dto, idUsuario);
      res.status(200).json(tratos);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
            return res.status(404).json({ error: "Propriedade não encontrada" });
        } else if (error.message === 'TALHAO_NAO_ENCONTRADO') {
            return res.status(404).json({ error: "Talhão não encontrado" });
        } else if (error.message === 'ACESSO_NEGADO') {
            return res.status(401).json({ error: 'Acesso negado! Não foi possível listar os tratos culturais' });
        } else if (error.message === 'TRATOS_NAO_ENCONTRADOS') {
            return res.status(404).json({ error: "Sem tratos culturais cadastrados para este talhão" });
        }
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro ao listar tratos' });
    };
  };
}

export default TratoCulturalController;