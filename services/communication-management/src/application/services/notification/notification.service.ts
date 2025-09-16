import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationStatus, NotificationType } from 'src/domain/entities/notification.entity';
import { NotificationChannel, NotificationPreference } from 'src/domain/entities/notification-preference.entity';
import { Repository } from 'typeorm';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { CreatePushNotificationDto } from 'src/presentation/dto/push-notification/create-push-notification.dto';
import { NotificationsGateway } from 'src/presentation/gateways/notifications.gateway';
import { EmailService } from '../email/email.service';
import { SMSSenderService } from '../sms/sms-sender.service';
import { CreateEmailDto } from 'src/presentation/dto/email/create-email.dto';

export interface CreateNotificationDto {
  user_id: string;
  type: NotificationType;
  message: string;
  metadata?: Record<string, any>;
}

export interface UpdatePreferenceDto {
  type: NotificationType;
  channel: NotificationChannel;
  isEnabled: boolean;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
    private readonly pushNotificationService: PushNotificationService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly emailService: EmailService,
    private readonly smsSenderService: SMSSenderService,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const newNotification = this.notificationRepository.create({
      user_id: dto.user_id,
      type: dto.type,
      message: dto.message,
      metadata: dto.metadata,
      status: NotificationStatus.UNREAD,
    });

    try {
      const savedNotification = await this.notificationRepository.save(newNotification);
      this.logger.log(`Successfully created in-app notification ${savedNotification.id} for user ${dto.user_id}`);

      this.notificationsGateway.sendNotificationToUser(savedNotification.user_id, savedNotification);

      await this.triggerPushNotification(dto);
      await this.triggerEmailNotification(dto);
      await this.triggerSmsNotification(dto);

      return savedNotification;
    } catch (error)
    {
      this.logger.error(`Failed to process notification for user ${dto.user_id}`, error.stack);
      throw error;
    }
  }

  private async shouldSendForChannel(userId: string, type: NotificationType, channel: NotificationChannel): Promise<boolean> {
    const preference = await this.preferenceRepository.findOne({
      where: {
        user_id: userId,
        notification_type: type,
        channel: channel,
      },
    });

    if (preference) {
      return preference.is_enabled;
    }

    return true; 
  }

  private async triggerPushNotification(dto: CreateNotificationDto): Promise<void> {
    const shouldSend = await this.shouldSendForChannel(dto.user_id, dto.type, NotificationChannel.PUSH);
    if (!shouldSend) {
      this.logger.log(`User ${dto.user_id} has disabled PUSH notifications for type ${dto.type}. Skipping.`);
      return;
    }
    
    try {
      const pushDto: CreatePushNotificationDto = {
        recipient: dto.user_id,
        title: this.getTitleForNotificationType(dto.type),
        message: dto.message,
      };
      await this.pushNotificationService.createPushNotification(pushDto);
      this.logger.log(`Successfully triggered push notification for user ${dto.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to trigger push notification for user ${dto.user_id}`, error.stack);
    }
  }

  private async triggerEmailNotification(dto: CreateNotificationDto): Promise<void> {
    const shouldSend = await this.shouldSendForChannel(dto.user_id, dto.type, NotificationChannel.EMAIL);
    if (!shouldSend) {
      this.logger.log(`User ${dto.user_id} has disabled EMAIL notifications for type ${dto.type}. Skipping.`);
      return;
    }

    try {
      const userEmail = `user-${dto.user_id}@example.com`;
      const subject = this.getTitleForNotificationType(dto.type);

      const emailDto: CreateEmailDto = {
        recipient: userEmail,
        subject: subject,
        body: dto.message,
      };
      
      await this.emailService.sendEmail(emailDto);
      this.logger.log(`Successfully triggered email notification for user ${dto.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to trigger email notification for user ${dto.user_id}`, error.stack);
    }
  }

  private async triggerSmsNotification(dto: CreateNotificationDto): Promise<void> {
    const shouldSend = await this.shouldSendForChannel(dto.user_id, dto.type, NotificationChannel.SMS);
    if (!shouldSend) {
      this.logger.log(`User ${dto.user_id} has disabled SMS notifications for type ${dto.type}. Skipping.`);
      return;
    }

    try {
      const userPhoneNumber = `+1555123${dto.user_id.substring(0, 4)}`;
      
      await this.smsSenderService.sendSMS(userPhoneNumber, dto.message, 'TEXT', 1);
      this.logger.log(`Successfully triggered SMS notification for user ${dto.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to trigger SMS notification for user ${dto.user_id}`, error.stack);
    }
  }
  
  async findForUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOneBy({ id: notificationId, user_id: userId });
    
    if (!notification) {
      return null;
    }

    notification.status = NotificationStatus.READ;
    return this.notificationRepository.save(notification);
  }

  async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    return this.preferenceRepository.find({
      where: { user_id: userId },
    });
  }

  async updateUserPreferences(userId: string, preferencesDto: UpdatePreferenceDto[]): Promise<NotificationPreference[]> {
    const updatedPreferences: NotificationPreference[] = [];

    for (const prefDto of preferencesDto) {
      let preference = await this.preferenceRepository.findOne({
        where: {
          user_id: userId,
          notification_type: prefDto.type,
          channel: prefDto.channel,
        },
      });

      if (preference) {
        preference.is_enabled = prefDto.isEnabled;
      } else {
        preference = this.preferenceRepository.create({
          user_id: userId,
          notification_type: prefDto.type,
          channel: prefDto.channel,
          is_enabled: prefDto.isEnabled,
        });
      }
      
      const savedPreference = await this.preferenceRepository.save(preference);
      updatedPreferences.push(savedPreference);
    }
    
    this.logger.log(`Updated ${updatedPreferences.length} preferences for user ${userId}`);
    return updatedPreferences;
  }
  
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const deleteResult = await this.notificationRepository.delete({
      id: notificationId,
      user_id: userId,
    });
    return deleteResult.affected > 0;
  }

  private getTitleForNotificationType(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
      [NotificationType.PAYMENT_SUCCESS]: 'Payment Successful',
      [NotificationType.PAYMENT_FAILURE]: 'Payment Failed',
      [NotificationType.EVENT_UPDATE]: 'Event Update',
      [NotificationType.EVENT_REMINDER]: 'Event Reminder',
      [NotificationType.TICKET_PURCHASE]: 'Ticket Purchase Confirmed',
      [NotificationType.ADMIN_ALERT]: 'Admin Alert',
      [NotificationType.GENERAL]: 'New Notification',
    };
    return titles[type] || 'New Notification';
  }
}