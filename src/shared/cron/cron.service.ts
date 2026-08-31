import cron from 'node-cron';
import { prisma } from '../../shared/config/database';
import { GerenciadorWebSocket } from '../websocket/websocket.manager';
import { TipoEvento, TipoNotificacao } from '../../features/notificacao/notificacao.dto';
import NotificacaoRepository, { EventoCronPayload } from '../../features/notificacao/notificacao.repository';
import Notificacao from '../../features/notificacao/notificacao.entity';

const notificacaoRepo = new NotificacaoRepository(prisma);

const mapaAgricola: Record<string, TipoEvento> = {
    armazenagens: TipoEvento.ARMAZENAGENS,
    tratosculturais: TipoEvento.TRATOS_CULTURAIS,
    colheitas: TipoEvento.COLHEITAS,
    fermentacoes: TipoEvento.FERMENTACOES,
    presecagens: TipoEvento.PRE_SECAGENS,
    secagens: TipoEvento.SECAGENS,
    pilagens: TipoEvento.PILAGENS
};

const MS_POR_DIA = 1000 * 60 * 60 * 24;

function calcularDiferencaDias(dataEvento: Date, dataAtual: Date): number {
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

function determinarTipoEvento(evento: EventoCronPayload): TipoEvento {
    if (evento.vendas) return TipoEvento.VENDAS;

    if (evento.eventosagricolas) {
        for (const [chave, tipo] of Object.entries(mapaAgricola)) {
            if (evento.eventosagricolas[chave as keyof typeof evento.eventosagricolas]) return tipo;
        }
    }
    throw new Error(`Tipo de evento desconhecido para o evento ${evento.idEvento_PK}`);
}

async function processarLimpezaNotificacoes(): Promise<void> {
    console.log('[CRON] Iniciando verificação de limpeza de notificações lidas...');

    const hoje = new Date();
    const limiteData = new Date(hoje);
    
    limiteData.setDate(hoje.getDate() - 7);

    let quantidadeExcluida = 0;

    await prisma.$transaction(async (tx) => {
        quantidadeExcluida = await notificacaoRepo.limparNotificacoesAntigasLidas(limiteData, tx);
    });

    if (quantidadeExcluida === 0) {
        console.log('[CRON] Nenhuma notificação antiga para limpar hoje.');
        return;
    }

    console.log(`[CRON] Limpeza concluída. ${quantidadeExcluida} notificações antigas foram excluídas.`);
}

async function processarNotificacaoAlvo(diasAlvo: number, tipoNotificacao: TipoNotificacao): Promise<void> {
    console.log(`[CRON] Buscando eventos para notificação: ${tipoNotificacao} (${diasAlvo} dias)`);

    const hoje = new Date();
    const dataAlvo = new Date(hoje);
    dataAlvo.setDate(hoje.getDate() + diasAlvo);

    const limiteInferior = new Date(dataAlvo);
    limiteInferior.setDate(dataAlvo.getDate() - 1);

    const limiteSuperior = new Date(dataAlvo);
    limiteSuperior.setDate(dataAlvo.getDate() + 1);

    const eventos = await notificacaoRepo.buscarEventosParaCron(limiteInferior, limiteSuperior);

    if (eventos.length === 0) return;

    const notificacoesDesejadas = [];

    for (const evento of eventos) {
        if (calcularDiferencaDias(evento.dataInicio, hoje) === diasAlvo) {
            try {
                notificacoesDesejadas.push({
                    idProprietario: evento.safras.propriedades.idProprietario_FK,
                    idPropriedade: evento.safras.idPropriedade_FK,
                    idEvento: evento.idEvento_PK,
                    tipoEvento: determinarTipoEvento(evento),
                    tipoNotificacao
                });
            } catch (erro) {
                console.error(`[CRON] Erro ao classificar evento ${evento.idEvento_PK}:`, erro);
            }
        }
    }

    if (notificacoesDesejadas.length === 0) return;

    for (const dto of notificacoesDesejadas) {
        try {
            await prisma.$transaction(async (tx) => {
                await notificacaoRepo.limparNotificacoesAntigasDoEvento(dto.idEvento, tx);

                const notificacao = new Notificacao(
                    undefined, dto.idProprietario, dto.idPropriedade,
                    dto.idEvento, dto.tipoEvento, dto.tipoNotificacao
                );

                const novaNotificacao = await notificacaoRepo.criar(notificacao, tx);
                GerenciadorWebSocket.obterInstancia().enviarParaUsuario(dto.idProprietario, novaNotificacao);
            });
        } catch (erro) {
            console.error(`[CRON] Erro ao salvar notificação do evento ${dto.idEvento}:`, erro);
        }
    }
    console.log(`[CRON] Finalizado. ${notificacoesDesejadas.length} notificações de ${tipoNotificacao} geradas.`);
}

export function iniciarCronJobs(): void {
    const configuracoesCron = [
        { hora: 10, diasAlvo: 7, tipo: TipoNotificacao.FUTURO_SETE },
        { hora: 9, diasAlvo: 3, tipo: TipoNotificacao.FUTURO_TRES },
        { hora: 8, diasAlvo: 2, tipo: TipoNotificacao.FUTURO_DOIS },
        { hora: 7, diasAlvo: 1, tipo: TipoNotificacao.FUTURO_UM },
        { hora: 5, diasAlvo: 0, tipo: TipoNotificacao.PRESENTE },
        { hora: 6, diasAlvo: -1, tipo: TipoNotificacao.PASSADO }
    ];

    cron.schedule('0 2 * * *', async () => {
        try {
            await processarLimpezaNotificacoes();
        } catch (erro) {
            console.error('[CRON] Erro na rotina de limpeza de notificações:', erro);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });

    for (const config of configuracoesCron) {
        cron.schedule(`0 ${config.hora} * * *`, async () => {
            try {
                await processarNotificacaoAlvo(config.diasAlvo, config.tipo);
            } catch (erro) {
                console.error(`[CRON] Erro na rotina de ${config.tipo}:`, erro);
            }
        }, {
            timezone: 'America/Sao_Paulo'
        });
    }

    console.log('[CRON] Múltiplos agendamentos registrados com sucesso (incluindo rotina de limpeza).');
};