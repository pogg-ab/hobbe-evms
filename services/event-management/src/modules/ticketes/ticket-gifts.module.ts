import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CancelTicketGiftsCommandHandler } from "src/application/handlers/tickets-gift/cancel-ticket-gifts.handler";
import { GetReceivedTicketsGiftHandler } from "src/application/handlers/tickets-gift/get-received-tickets-gift.handler";
import { GetSentTicketsGiftHandler } from "src/application/handlers/tickets-gift/get-sent-tickets-gift.handler";
import { TicketsGiftServices } from "src/application/services/tickets-gift/tickets-gift.services";
import { TicketGifts } from "src/domain/entities/ticket-gifts.entity";
import { TOKEN_TICKETS_GIFT_REPOSITORY } from "src/domain/repositories/tickets/tickets-gift/tickets-gift-repository.token";
import { TicketGiftsRepositoryImpl } from "src/infrastructure/persistence/repositories/ticket-gifts.repository.impl";
import { TicketsGiftController } from "src/presentation/controllers/tickets-gift/tickets-gift.controller";
import { TicketsModule } from "./tickets.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([TicketGifts]),
        CqrsModule,
        TicketsModule,
    ],
    controllers: [
        TicketsGiftController
    ],
    providers: [
        TicketsGiftServices,
        GetSentTicketsGiftHandler,
        GetReceivedTicketsGiftHandler,
        CancelTicketGiftsCommandHandler,
        {
            provide: TOKEN_TICKETS_GIFT_REPOSITORY,
            useClass: TicketGiftsRepositoryImpl,
        }
    ],
    exports: [
        TOKEN_TICKETS_GIFT_REPOSITORY,
        TicketsGiftServices
    ],
})

export class TicketGiftsModule {}
