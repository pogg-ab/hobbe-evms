import { Controller, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateNotificationDto, NotificationService } from 'src/application/services/notification/notification.service';
import { NotificationType } from 'src/domain/entities/notification.entity';

// A simple helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Controller()
export class NotificationConsumerController implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumerController.name);

  constructor(
    private readonly notificationService: NotificationService,
    @Inject('USER_MANAGEMENT_SERVICE') private readonly userManagementClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.userManagementClient.subscribeToResponseOf('get_all_user_ids');
    await this.userManagementClient.connect();
  }

  /**
   * A private helper method that attempts to fetch all user IDs via RPC,
   * with a built-in retry mechanism to handle temporary Kafka "leadership election" errors.
   */
  private async getAllUserIdsWithRetry(retryCount = 3): Promise<string[]> {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const userIds = await lastValueFrom(
          this.userManagementClient.send('get_all_user_ids', {})
        );
        return userIds; // Success
      } catch (error) {
        this.logger.warn(`RPC call to get all user IDs failed on attempt ${attempt}. Error: ${error.message}`);
        if (attempt === retryCount) {
          this.logger.error('All RPC retry attempts failed. Aborting broadcast.');
          throw error; // Re-throw the error after all retries fail
        }
        await delay(2000); // Wait 2 seconds before the next attempt
      }
    }
    return []; // Should not be reached, but provides a fallback
  }

  @MessagePattern('broadcast_notification')
  async handleBroadcastNotification(@Payload() payload: any): Promise<void> {
    this.logger.log(`Received 'broadcast_notification' event for alert: "${payload.title}".`);
    
    try {
      const allUserIds = await this.getAllUserIdsWithRetry();

      if (!allUserIds || allUserIds.length === 0) {
        this.logger.warn('Broadcast aborted: Received an empty list of user IDs or RPC call failed.');
        return;
      }
      this.logger.log(`Fetched ${allUserIds.length} user IDs for broadcast.`);

      const creationPromises = allUserIds.map(userId => {
        const notificationDto: CreateNotificationDto = {
          user_id: userId,
          type: NotificationType.GENERAL,
          message: `[${payload.title}] ${payload.message}`,
          metadata: payload.metadata,
        };
        return this.notificationService.createNotification(notificationDto)
          .catch(err => this.logger.error(`Failed to create broadcast notification for user ${userId}`, err.stack));
      });
      
      await Promise.all(creationPromises);
      this.logger.log(`Finished processing broadcast for alert: "${payload.title}".`);

    } catch (error) {
      this.logger.error(`Failed to handle 'broadcast_notification' event after all retries.`, error.stack);
    }
  }

  @MessagePattern('selective_notification')
  async handleSelectiveNotification(@Payload() payload: any): Promise<void> {
    const recipientCount = payload.recipientUserIds.length;
    this.logger.log(`Received 'selective_notification' event for alert: "${payload.title}". Targeting ${recipientCount} recipients.`);

    const creationPromises = payload.recipientUserIds.map(userId => {
      const notificationDto: CreateNotificationDto = {
        user_id: userId,
        type: NotificationType.ADMIN_ALERT,
        message: `[${payload.title}] ${payload.message}`,
        metadata: payload.metadata,
      };
      return this.notificationService.createNotification(notificationDto)
        .catch(err => this.logger.error(`Failed to create selective notification for user ${userId}`, err.stack));
    });

    await Promise.all(creationPromises);
    this.logger.log(`Finished processing selective notification for alert: "${payload.title}".`);
  }

  @MessagePattern('payment_successful')
  async handlePaymentSuccess(@Payload() payload: any) {
    this.logger.log(`Received payment_successful event for user ${payload.userId}`);
    try {
      const amount = payload.amount ?? 0;
      const currency = payload.currency ?? 'your_default_currency';
      const message = `Your payment of ${amount} ${currency} was successful.`;
      const notificationDto: CreateNotificationDto = { user_id: payload.userId, type: NotificationType.PAYMENT_SUCCESS, message: message, metadata: { transactionId: payload.transactionId, amount: payload.amount, currency: payload.currency }};
      await this.notificationService.createNotification(notificationDto);
    } catch (error) { this.logger.error(`Failed to handle 'payment_successful' event for user ${payload.userId}`, error.stack); }
  }

  @MessagePattern('event_updated')
  async handleEventUpdate(@Payload() payload: any) {
    this.logger.log(`Received event_updated event for event ${payload.eventId}, targeting ${payload.userIds.length} users.`);
    const creationPromises = payload.userIds.map(userId => {
      const notificationDto: CreateNotificationDto = { user_id: userId, type: NotificationType.EVENT_UPDATE, message: `An update on "${payload.eventName}": ${payload.updateMessage}`, metadata: { eventId: payload.eventId, eventName: payload.eventName }};
      return this.notificationService.createNotification(notificationDto).catch(error => this.logger.error(`Failed to create 'event_updated' notification for user ${userId}`, error.stack));
    });
    await Promise.all(creationPromises);
  }

  @MessagePattern('event_reminder')
  async handleEventReminder(@Payload() event: any) {
    this.logger.log(`Received 'event_reminder' for event ${event.eventId}`);
    const creationPromises = event.userIds.map(userId => {
      const notificationDto: CreateNotificationDto = { user_id: userId, type: NotificationType.EVENT_REMINDER, message: event.updateMessage, metadata: { eventId: event.eventId, eventName: event.eventName }};
      return this.notificationService.createNotification(notificationDto).catch(err => this.logger.error(`Failed to create reminder for user ${userId}`, err.stack));
    });
    await Promise.all(creationPromises);
  }

  @MessagePattern('ticket_purchased')
  async handleTicketPurchased(@Payload() event: any): Promise<void> {
    this.logger.log(`Received 'ticket_purchased' event for user ${event.userId}`);
    try {
      const notificationPayload: CreateNotificationDto = { user_id: event.userId, type: NotificationType.TICKET_PURCHASE, message: event.message, metadata: event.metadata };
      await this.notificationService.createNotification(notificationPayload);
    } catch (error) { this.logger.error(`Failed to handle 'ticket_purchased' event for user ${event.userId}`, error.stack); }
  }

  @MessagePattern('payment_failed')
  async handlePaymentFailed(@Payload() event: any) {
    this.logger.log(`Received 'payment_failed' event for user ${event.userId}`);
    const notificationDto: CreateNotificationDto = { user_id: event.userId, type: NotificationType.PAYMENT_FAILURE, message: `Your payment of ${event.amount} ${event.currency} failed. Reason: ${event.reason}`, metadata: { transactionId: event.transactionId }};
    await this.notificationService.createNotification(notificationDto);
  }
}