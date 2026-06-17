import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import TalhaoService from './talhao.service';
import { CadastrarTalhaoDTO, EncerrarTalhaoDTO } from './talhao.dto';

export class TalhaoController {
  constructor(private readonly talhaoService: TalhaoService) {}

  public async cadastrar(req: Request, res: Response): Promise<Response | void> {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    try {
      const dto: CadastrarTalhaoDTO = req.body;
      const idUsuario = req.session.idUsuario!
      await this.talhaoService.cadastrarTalhao(dto, idUsuario);
      
      return res.status(201).json({mensagem: 'Talhão cadastrado com sucesso!'});
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro interno inesperado ao cadastrar talhão.' });
    };
  };

  public async encerrar(req: Request, res: Response): Promise<Response | void> {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    };

    try {
      const idTalhao = Number(req.params.id);
      const dataFim = new Date(req.body.dataFim as string);
      const idUsuario = req.session.idUsuario!;

      const dto: EncerrarTalhaoDTO = { idTalhao, dataFim };
      await this.talhaoService.encerrarTalhao(dto, idUsuario);

      return res.status(200).json({ 
        message: 'Talhão encerrado e arquivado com sucesso.' 
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      };
      return res.status(500).json({ error: 'Erro interno inesperado ao encerrar talhão.' });
    };
  };
}
export default TalhaoController;