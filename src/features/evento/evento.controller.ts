import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { EventoService } from './evento.service';
import { BuscarEventosPropriedadeDTO } from './evento.dto';

export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  public async listarEventosPorPropriedade(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dataInicioStr = req.query.dataInicio as string;
      const dataFimStr = req.query.dataFim as string;

      const dto: BuscarEventosPropriedadeDTO = {
        idPropriedade: Number(req.params.id),
        dataInicio: new Date(dataInicioStr),
        dataFim: new Date(dataFimStr),
      };
      
      const relatorio = await this.eventoService.listarEventosPropriedade(dto, req.session.idUsuario!);
      
      res.status(200).json(relatorio);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'SEM_EVENTOS') {
          return res.status(404).json({ error: 'Nenhum evento encontrado' });
        }
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(403).json({ error: 'Acesso negado à propriedade' });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao listar eventos' });
    }
  }
}