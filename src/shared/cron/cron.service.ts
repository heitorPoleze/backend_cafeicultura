import cron from 'node-cron';
import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/config/database';
import { GerenciadorWebSocket } from '../websocket/websocket.manager';
import { TipoEvento, TipoNotificacao } from '../../features/notificacao/notificacao.dto';
import NotificacaoRepository from '../../features/notificacao/notificacao.repository';

const notificacaoRepo = new NotificacaoRepository(prisma);

const eventoSelect = {
    idEvento_PK: true,
    dataInicio: true,
    safras: {
        select: {
            idPropriedade_FK: true,
            propriedades: { select: { idProprietario_FK: true } }
        }
    },
    eventosagricolas: {
        select: {
            armazenagens: { select: { idEventoAgricola_PFK: true } },
            tratosculturais: { select: { idEventoAgricola_PFK: true } },
            colheitas: { select: { idEventoAgricola_PFK: true } },
            fermentacoes: { select: { idEventoAgricola_PFK: true } },
            presecagens: { select: { idEventoAgricola_PFK: true } },
            secagens: { select: { idEventoAgricola_PFK: true } },
            pilagens: { select: { idEventoAgricola_PFK: true } }
        }
    },
    vendas: { select: { idEvento_PFK: true } }
} satisfies Prisma.eventosSelect;

type EventoPayload = Prisma.eventosGetPayload<{ select: typeof eventoSelect }>;

const mapaAgricola: Record<string, TipoEvento> = {
    armazenagens: TipoEvento.ARMAZENAGENS,
    tratosculturais: TipoEvento.TRATOS_CULTURAIS,
    colheitas: TipoEvento.COLHEITAS,
    fermentacoes: TipoEvento.FERMENTACOES,
    presecagens: TipoEvento.PRE_SECAGENS,
    secagens: TipoEvento.SECAGENS,
    pilagens: TipoEvento.PILAGENS
};

const mapaDiasNotificacao: Record<number, TipoNotificacao> = {
    7: TipoNotificacao.FUTURO_SETE,
    3: TipoNotificacao.FUTURO_TRES,
    2: TipoNotificacao.FUTURO_DOIS,
    1: TipoNotificacao.FUTURO_UM,
   [-1]: TipoNotificacao.PASSADO
};

const MS_POR_DIA = 1000 * 60 * 60 * 24;

function calcularDiferencaDias(dataEvento: Date, dataAtual: Date): number {
    // FIXED: Using getUTCDate() to ignore the local timezone shift from the database
    const utcEvento = Date.UTC(
        dataEvento.getUTCFullYear(), 
        dataEvento.getUTCMonth(), 
        dataEvento.getUTCDate()
    );
    
    const utcAtual = Date.UTC(
        dataAtual.getFullYear(), 
        dataAtual.getMonth(), 
        dataAtual.getDate()
    );
    
    return Math.round((utcEvento - utcAtual) / MS_POR_DIA);
}

function determinarTipoEvento(evento: EventoPayload): TipoEvento {
    if (evento.vendas) return TipoEvento.VENDAS;

    if (evento.eventosagricolas) {
        for (const [chave, tipo] of Object.entries(mapaAgricola)) {
            if (evento.eventosagricolas[chave as keyof typeof evento.eventosagricolas]) return tipo;
        }
    }
    throw new Error(`Tipo de evento desconhecido para o evento ${evento.idEvento_PK}`);
}

async function processarNotificacoes(): Promise<void> {
    console.log('[CRON] Iniciando verificação de notificações...');

    const hoje = new Date();
    
    const limiteInferior = new Date(hoje);
    limiteInferior.setDate(hoje.getDate() - 2);

    const limiteSuperior = new Date(hoje);
    limiteSuperior.setDate(hoje.getDate() + 8);

    const eventos = await prisma.eventos.findMany({
        where: {
            dataFim: null,
            dataInicio: {
                gte: limiteInferior,
                lte: limiteSuperior
            }
        },
        select: eventoSelect
    });

    if (eventos.length === 0) {
        console.log('[CRON] Nenhum evento na janela de tempo.');
        return;
    }

    const notificacoesDesejadas = [];
    
    for (const evento of eventos) {
        const diffDays = calcularDiferencaDias(evento.dataInicio, hoje);
        const tipoNotificacao = mapaDiasNotificacao[diffDays];

        if (tipoNotificacao) {
            try {
                const tipoEvento = determinarTipoEvento(evento);
                notificacoesDesejadas.push({
                    idProprietario: evento.safras.propriedades.idProprietario_FK,
                    idPropriedade: evento.safras.idPropriedade_FK,
                    idEvento: evento.idEvento_PK,
                    tipoEvento,
                    tipoNotificacao
                });
            } catch (erro) {
                console.error(`[CRON] Erro ao classificar evento ${evento.idEvento_PK}:`, erro);
            }
        }
    }

    if (notificacoesDesejadas.length === 0) return;

    const idsEventos = [...new Set(notificacoesDesejadas.map(n => n.idEvento))];
    const existentes = await notificacaoRepo.listarExistentesPorEventos(idsEventos);

    const setExistentes = new Set(
        existentes.map(e => `${e.idEvento_FK}-${e.tipoNotificacao}`)
    );

    const notificacoesParaCriar = notificacoesDesejadas.filter(n => 
        !setExistentes.has(`${n.idEvento}-${n.tipoNotificacao}`)
    );

    const promisesDeDespacho = notificacoesParaCriar.map(async (dto) => {
        try {
            const novaNotificacao = await notificacaoRepo.criar({
                idProprietario: dto.idProprietario,
                idPropriedade: dto.idPropriedade,
                idEvento: dto.idEvento,
                tipoEvento: dto.tipoEvento,
                tipoNotificacao: dto.tipoNotificacao
            });

            GerenciadorWebSocket.obterInstancia().enviarParaUsuario(dto.idProprietario, novaNotificacao);
        } catch (erro) {
            console.error(`[CRON] Erro ao salvar notificação do evento ${dto.idEvento}:`, erro);
        }
    });

    await Promise.all(promisesDeDespacho);
    
    console.log(`[CRON] Finalizado. ${notificacoesParaCriar.length} novas notificações geradas.`);
}

export function iniciarCronJobs(): void {
    cron.schedule('* 3 * * *', async () => {
        try {
            await processarNotificacoes();
        } catch (erro) {
            console.error('[CRON] Erro geral:', erro);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });
}