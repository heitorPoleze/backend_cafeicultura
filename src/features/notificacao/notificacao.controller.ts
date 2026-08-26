import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import NotificacaoService from './notificacao.service';
import { ListarPorPropriedadeDTO, MarcarComoLidaDTO } from './notificacao.dto';

class NotificacaoController {
    constructor(private readonly notificacaoService: NotificacaoService) { }


    public async listarTodas(req: Request, res: Response) {
        try {
            const notificacoes = await this.notificacaoService.listarTodas({ idProprietario: req.session.idUsuario! });

            return res.status(200).json(notificacoes);
        } catch (error: unknown) {
            return res.status(500).json({ error: 'Erro ao buscar notificações.' });
        }
    }

    public async listarTodasPropriedade(req: Request, res: Response) {
        try {
            const dto: ListarPorPropriedadeDTO = {
                idProprietario: req.session.idUsuario!,
                idPropriedade: Number(req.params.id)
            };
            const notificacoes = await this.notificacaoService.listarTodasPropriedade(dto);

            return res.status(200).json(notificacoes);
        } catch (error: unknown) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar notificações.' });
        }
    }

    public async listarNaoLidas(req: Request, res: Response) {
        try {
            const notificacoes = await this.notificacaoService.listarNaoLidas({ idProprietario: req.session.idUsuario! });

            return res.status(200).json(notificacoes);
        } catch (error: unknown) {
            return res.status(500).json({ error: 'Erro ao buscar notificações não lidas.' });
        }
    }

    public async listarNaoLidasPropriedade(req: Request, res: Response) {
        try {
            const dto: ListarPorPropriedadeDTO = {
                idProprietario: req.session.idUsuario!,
                idPropriedade: Number(req.params.id)
            };
            const notificacoes = await this.notificacaoService.listarNaoLidasPropriedade(dto);

            return res.status(200).json(notificacoes);
        } catch (error: unknown) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar notificações não lidas.' });
        }
    }


    public async marcarComoLida(req: Request, res: Response) {
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

        try {
            const dto: MarcarComoLidaDTO = {
                idProprietario: req.session.idUsuario!,
                idNotificacao: Number(req.params.id)
            };
            await this.notificacaoService.marcarComoLida(dto);
            return res.status(204).send();
        } catch (error: unknown) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar o status da notificação.' });
        }
    }
}

export default NotificacaoController;