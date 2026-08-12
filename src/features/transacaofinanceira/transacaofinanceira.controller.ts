import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import TransacaoFinanceiraService from './transacaofinanceira.service';
import { BuscarExtratoFinanceiroDTO } from './transacaofinanceira.dto';

class TransacaoFinanceiraController {
  constructor(private readonly transacaoService: TransacaoFinanceiraService) {}

  public async gerarExtrato(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dataInicioStr = req.query.dataInicio as string | undefined;
      const dataFimStr = req.query.dataFim as string | undefined;
      const paginaStr = req.query.pagina as string | undefined;
      const limiteStr = req.query.limite as string | undefined;

      const dto: BuscarExtratoFinanceiroDTO = {
        idPropriedade: Number(req.params.id),
        dataInicio: dataInicioStr ? new Date(dataInicioStr) : undefined,
        dataFim: dataFimStr ? new Date(dataFimStr) : undefined,
        pagina: paginaStr ? Number(paginaStr) : 1,
        limite: limiteStr ? Number(limiteStr) : 25
      };
      
      const relatorio = await this.transacaoService.gerarExtrato(dto, req.session.idUsuario!);
      
      res.status(200).json(relatorio);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') {
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado' });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao gerar extrato financeiro' });
    }
  }
}

export default TransacaoFinanceiraController;