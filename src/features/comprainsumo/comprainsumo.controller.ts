import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import CompraInsumoService from './comprainsumo.service';
import { 
  CadastrarCompraInsumoDTO, 
  ListarPorInsumoDescricaoDTO, 
  ListarPorPropriedadeDTO, 
  ListarPorProprietarioDTO 
} from './comprainsumo.dto';

export class CompraInsumoController {
  constructor(private readonly compraInsumoService: CompraInsumoService) {}

  public async cadastrar(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: CadastrarCompraInsumoDTO = req.body;
      const idUsuario = req.session.idUsuario!;
      
      const idGerado = await this.compraInsumoService.cadastrar(dto, idUsuario);
      
      res.status(201).json({mensagem: 'Compra de Insumo registrada com sucesso e despesa gerada'});
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') return res.status(404).json({ error: "Propriedade não encontrada" });
        if (error.message === 'FORNECEDOR_NAO_ENCONTRADO') return res.status(404).json({ error: "Fornecedor não encontrado" });
        if (error.message === 'INSUMO_NAO_ENCONTRADO') return res.status(404).json({ error: "Insumo não encontrado" });
        if (error.message === 'ACESSO_NEGADO') {
          return res.status(401).json({ error: 'Acesso negado! Você não é o proprietário.' });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao registrar compra de insumo' });
    }
  }

  public async buscarPorId(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const id = Number(req.params.id);
      const idUsuario = req.session.idUsuario!;
      
      const compra = await this.compraInsumoService.buscarPorId(id, idUsuario);
      res.status(200).json(compra);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'COMPRA_NAO_ENCONTRADA') return res.status(404).json({ error: "Registro de compra não encontrado" });
        if (error.message === 'ACESSO_NEGADO') return res.status(401).json({ error: 'Acesso negado ao visualizar esta compra' });
        
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao buscar compra' });
    }
  }

  public async listarPorPropriedade(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: ListarPorPropriedadeDTO = { idPropriedade: Number(req.params.idPropriedade) };
      const idUsuario = req.session.idUsuario!;
      
      const compras = await this.compraInsumoService.listarPorPropriedade(dto, idUsuario);
      res.status(200).json(compras);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'COMPRAS_NAO_ENCONTRADAS') return res.status(404).json({ error: "Nenhuma compra encontrada para esta propriedade" });
        if (error.message === 'PROPRIEDADE_NAO_ENCONTRADA') return res.status(404).json({ error: "Propriedade não encontrada" });
        if (error.message === 'ACESSO_NEGADO') return res.status(401).json({ error: 'Acesso negado ao listar compras da propriedade' });
        
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao listar compras' });
    }
  }

  public async listarPorProprietario(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: ListarPorProprietarioDTO = { idProprietario: Number(req.session.idUsuario!) };      
      const compras = await this.compraInsumoService.listarPorProprietario(dto);
      res.status(200).json(compras);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'COMPRAS_NAO_ENCONTRADAS') return res.status(404).json({ error: "Nenhuma compra encontrada para este proprietário" });
        if (error.message === 'ACESSO_NEGADO') return res.status(401).json({ error: 'Acesso negado ao visualizar compras deste proprietário' });
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao listar compras do proprietário' });
    }
  }

  public async listarPorInsumoDescricao(req: Request, res: Response) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    try {
      const dto: ListarPorInsumoDescricaoDTO = { 
        descricao: String(req.params.descricao),
      };
      
      const compras = await this.compraInsumoService.listarPorInsumoDescricao(dto, req.session.idUsuario!);
      res.status(200).json(compras);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'COMPRAS_NAO_ENCONTRADAS') return res.status(404).json({ error: "Nenhuma compra encontrada para este insumo" });
        
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno ao buscar compras por insumo' });
    }
  }
}

export default CompraInsumoController;