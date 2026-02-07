// rpc-consumer.service.ts
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { EventsService } from 'src/application/services/events/events.service';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { TicketsService } from 'src/application/services/tickets/tickets.service';

@Injectable()
export class KafkaRefundRpcConsumerService implements OnModuleInit {
  private kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
  private consumer = this.kafka.consumer({
    groupId: 'refund-rpc-client-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    rebalanceTimeout: 60000,
  });
  private producer = this.kafka.producer();

  constructor(
    private readonly eventService: EventsService,
    private readonly ticketBookingService: TicketBookingService,
    private readonly ticketService: TicketsService,
  ) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();
    await this.consumer.subscribe({
      topic: 'refund-request-topic',
      fromBeginning: false,
    });

    this.consumer.run({
      eachMessage: async ({ message }) => {
        const key = message.key?.toString();
        const replyTopic = message.headers?.replyTopic?.toString();

        try {
          if (!key || !replyTopic) {
            throw new BadRequestException(
              'Missing key or replyTopic in message',
            );
          }
          const data = message.value
            ? JSON.parse(message.value.toString())
            : null;

          // chek event exists and before have 24 hours before event start time
          const event = await this.eventService.findOne(data.eventId);
          if (!event) {
            throw new BadRequestException('Event not found');
          }
           const timeDiff = event.event_start_date.getTime() - Date.now();
          const eligibility = timeDiff <= 24 * 60 * 60 * 1000;


           if(eligibility && data.refundType === 'auto'){
            throw new BadRequestException('Event start date less than 24hr, manual refund required');
           }
         
         
          await this.ticketBookingService.processRefund(data.bookingId);

          //  check tickets  exists and belongs to bookingId
          const tickets = await this.ticketService.findTicketsByBookingId(
            data.bookingId,
          );
          // make each ticket status to refunded
          for (const ticket of tickets) {
            await this.ticketService.ticketRefundProcess(ticket.id.toString());
          }

          const response = {
            eligibleToRefund: true,
            data: message.value ? JSON.parse(message.value.toString()) : null,
            event,
          };

          await this.producer.send({
            topic: replyTopic!,
            messages: [
              {
                key,
                value: JSON.stringify(response),
              },
            ],
          });
        } catch (err: any) {
          //   console.error('Error processing message:', err?.message || err);

          // Optional: send an error response back to replyTopic
          if (replyTopic) {
            const errorResponse = {
              eligibleToRefund: false,
              error: err?.message || 'Unknown error',
            };

            await this.producer.send({
              topic: replyTopic,
              messages: [
                {
                  key,
                  value: JSON.stringify(errorResponse),
                },
              ],
            });
          }
        }
      },
    });
  }
}
