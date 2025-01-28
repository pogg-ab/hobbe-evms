import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PushNotification } from 'src/domain/entities/push-notification.entity';
import { IPushNotificationRepository } from 'src/domain/repositories/push-notification/push-notification.repository';
import { PushNotificationID } from 'src/domain/value-objects/push-notification-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class PushNotificationRepositoryImpl
  implements IPushNotificationRepository
{
  constructor(
    @InjectRepository(PushNotification)
    private readonly pushNotificationRepository: Repository<PushNotification>,
  ) {}

  async create(pushNotification: PushNotification): Promise<PushNotification> {
    try {
      const newNotification =
        this.pushNotificationRepository.create(pushNotification);
      return await this.pushNotificationRepository.save(newNotification);
    } catch (error) {
      throw new HttpException(
        `Error creating push notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<PushNotification[]> {
    try {
      return await this.pushNotificationRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching push notifications: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(id: PushNotificationID): Promise<PushNotification | null> {
    try {
      const notification = await this.pushNotificationRepository.findOne({
        where: { id: id },
      });
      return notification || null;
    } catch (error) {
      throw new HttpException(
        `Error fetching push notification by ID: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: PushNotificationID,
    pushNotification: PushNotification,
  ): Promise<PushNotification> {
    try {
      const existingNotification =
        await this.pushNotificationRepository.findOne({
          where: { id: id },
        });
      if (!existingNotification) {
        throw new HttpException(
          `Push notification with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedNotification = Object.assign(
        existingNotification,
        pushNotification,
      );
      return await this.pushNotificationRepository.save(updatedNotification);
    } catch (error) {
      throw new HttpException(
        `Error updating push notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: PushNotificationID): Promise<void> {
    try {
      const notification = await this.pushNotificationRepository.findOne({
        where: { id: id },
      });
      if (!notification) {
        throw new HttpException(
          `Push notification with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.pushNotificationRepository.delete(id.toString());
    } catch (error) {
      throw new HttpException(
        `Error deleting push notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatus(
    id: PushNotificationID,
    status: 'SENT' | 'FAILED' | 'PENDING' | null,
    updatedBy: string,
  ): Promise<void> {
    try {
      const notification = await this.pushNotificationRepository.findOne({
        where: { id: id },
      });
      if (!notification) {
        throw new HttpException(
          `Push notification with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      notification.status = status;
      notification.updated_by = updatedBy;
      notification.updated_at = new Date();

      if (status === 'SENT') {
        notification.sent_at = new Date();
      } else if (status === 'FAILED') {
        notification.sent_at = null;
      }

      await this.pushNotificationRepository.save(notification);
    } catch (error) {
      throw new HttpException(
        `Error updating push notification status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateDeliveredAt(
    id: PushNotificationID,
    deliveredAt: Date,
  ): Promise<void> {
    try {
      const notification = await this.pushNotificationRepository.findOne({
        where: { id: id },
      });
      if (!notification) {
        throw new HttpException(
          `Push notification with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      notification.delivered_at = deliveredAt;
      await this.pushNotificationRepository.save(notification);
    } catch (error) {
      throw new HttpException(
        `Error updating delivered_at for push notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
