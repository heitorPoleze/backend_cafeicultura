import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import DespesaService from './despesa.service';
import { 
  BuscarDespesaDTO, 
  CriarDespesaDTO, 
  ExcluirDespesaDTO, 
  ListarDespesasPropriedadeDTO, 
  ListarDespesasProprietarioDTO 
} from './despesa.dto';

export class DespesaController {
  constructor(private readonly despesaService: DespesaService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    try {
      const dto: CriarDespesaDTO = req.body;
      const idUsuario = req.session.idUsuario!; 
      
      await this.despesaService.cadastrar(dto, idUsuario);
      
      res.status(201).json({
        mensagem: 'Despesa cadastrada com sucesso'
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') return res.status(404).json({ error: "Propriedade não encontrada" });
        if (error.message === 'PESSOA_NAO_ENCONTRADA') return res.status(404).json({ error: "Beneficiado não encontrado" });
        if (error.message === 'ACESSO_NEGADO') return res.status(401).json({ error: 'Acesso negado! Você não tem permissão para cadastrar despesas nesta propriedade.' });

        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao cadastrar despesa' });
    }
  }

  public async buscarPorId(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: BuscarDespesaDTO = { id: Number(req.params.id) };
      const idUsuario = req.session.idUsuario!;
      const despesa = await this.despesaService.buscarPorId(dto, idUsuario);
      res.status(200).json(despesa);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'DESPESA_NAO_ENCONTRADA') return res.status(404).json({ error: "Despesa não encontrada" });
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') return res.status(404).json({ error: "Propriedade vinculada não encontrada" });
        if (error.message === 'ACESSO_NEGADO') return res.status(401).json({ error: 'Acesso negado ao buscar despesa' });
        
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao buscar despesa' });
    }
  }

  public async listarPorPropriedade(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: ListarDespesasPropriedadeDTO = { idPropriedade: Number(req.params.idPropriedade) };
      const idUsuario = req.session.idUsuario!;
      
      const despesas = await this.despesaService.listarPorPropriedade(dto, idUsuario);
      res.status(200).json(despesas);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'DESPESAS_NAO_ENCONTRADAS') return res.status(404).json({ error: "Nenhuma despesa encontrada para esta propriedade" });
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') return res.status(404).json({ error: "Propriedade não encontrada" });
        if (error.message === 'ACESSO_NEGADO') return res.status(401).json({ error: 'Acesso negado ao listar despesas da propriedade' });
        
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao listar despesas' });
    }
  }

  public async listarPorProprietario(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: ListarDespesasProprietarioDTO = {idProprietario: req.session.idUsuario!};

      const despesas = await this.despesaService.listarPorProprietario(dto);
      res.status(200).json(despesas);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'DESPESAS_NAO_ENCONTRADAS') return res.status(404).json({ error: "Nenhuma despesa encontrada para este proprietário" });
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao listar despesas do proprietário' });
    }
  }

  public async excluir(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: ExcluirDespesaDTO = { id: Number(req.params.id) };
      const idUsuario = req.session.idUsuario!;
      
      await this.despesaService.excluir(dto, idUsuario);
      
      res.status(200).json({ mensagem: 'Despesa excluída com sucesso' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'DESPESA_NAO_ENCONTRADA') return res.status(404).json({ error: "Despesa não encontrada" });
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') return res.status(404).json({ error: "Propriedade vinculada não encontrada" });
        if (error.message === 'ACESSO_NEGADO') return res.status(401).json({ error: 'Acesso negado ao excluir despesa' });
        
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao excluir despesa' });
    }
  }
}

export default DespesaController;