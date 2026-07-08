import { PrismaClient, Prisma } from '@prisma/client';
import EventoAgricola from './eventoagricola.entity'; 

export class EventoAgricolaRepository {
    constructor(private prisma: PrismaClient) {}

    public async cadastrar(
        evento: EventoAgricola, 
        idEvento: number,
        tx: Prisma.TransactionClient
    ): Promise<number> {
        const eventoAgricolaDB = await tx.eventosagricolas.create({
            data: {
                idEvento_PFK: idEvento,
                idTalhao_FK: evento.idTalhao 
            },
        });

        return eventoAgricolaDB.idEvento_PFK;
    };
};

export default EventoAgricolaRepository;