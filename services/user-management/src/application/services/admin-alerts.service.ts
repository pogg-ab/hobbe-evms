import { BadRequestException, Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminAlert } from 'src/domain/entities/admin-alert.entity';
import { Repository } from 'typeorm';
import { CreateAdminAlertDto } from '../../presentation/dtos/admin-alerts/create-admin-alert.dto';
import { UpdateAdminAlertDto } from '../../presentation/dtos/admin-alerts/update-admin-alert.dto';
import { AdminAlertLog } from 'src/domain/entities/admin-alert-log.entity';
import { AdminAlertSubscription, NotificationChannel } from 'src/domain/entities/admin-alert-subscription.entity';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { GetAlertLogsQueryDto } from 'src/presentation/dtos/admin-alerts/get-alert-logs-query.dto';
import { UserAlertSubscription } from 'src/domain/entities/user-alert-subscription.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';

@Injectable()
export class AdminAlertsService {
  private readonly logger = new Logger(AdminAlertsService.name);
  constructor(
    @InjectRepository(AdminAlert)
    private readonly adminAlertRepository: Repository<AdminAlert>,
    @InjectRepository(AdminAlertLog)
    private readonly adminAlertLogRepository: Repository<AdminAlertLog>,
    @InjectRepository(AdminAlertSubscription)
    private readonly adminSubscriptionRepository: Repository<AdminAlertSubscription>,
    @InjectRepository(UserAlertSubscription)
    private readonly userSubscriptionRepository: Repository<UserAlertSubscription>,
    @InjectRepository(AdminUser) 
    private readonly adminUserRepository: Repository<AdminUser>,
    private readonly messageProducerService: MessageProducerService,
  ) {}

  
  async addAdminSubscription(alertId: string, adminId: string): Promise<AdminAlertSubscription> {
    
    await this.findOne(alertId);

    
    const adminUser = await this.adminUserRepository.findOneBy({ admin_user_id: adminId });
    if (!adminUser) {
      throw new NotFoundException(`Admin user with ID ${adminId} not found.`);
    }

    
    const existingSub = await this.adminSubscriptionRepository.findOneBy({ alert_id: alertId, admin_id: adminId });
    if (existingSub) {
      throw new ConflictException(`Admin ${adminId} is already subscribed to alert ${alertId}.`);
    }
    
    
    const newSub = this.adminSubscriptionRepository.create({ 
      alert_id: alertId, 
      admin_id: adminId,
      channel: NotificationChannel.IN_APP,
    });

    return this.adminSubscriptionRepository.save(newSub);
  }
  
  async triggerAlert(alertId: string, message: string, relatedEntityId?: string): Promise<AdminAlertLog> {
    const alertDefinition = await this.findOne(alertId);
    if (!alertDefinition.is_active) { throw new BadRequestException(`Cannot trigger a deactivated alert (ID: ${alertId}).`); }
    const newLogEntry = this.adminAlertLogRepository.create({ alert_id: alertId, message: message, related_entity_id: relatedEntityId });
    const savedLog = await this.adminAlertLogRepository.save(newLogEntry);
    this.logger.log(`Created new alert log entry: ${savedLog.alert_log_id}`);
    if (alertDefinition.is_broadcast) {
      const broadcastPayload = { title: alertDefinition.title, message: message, metadata: { alertId: alertId, alertLogId: savedLog.alert_log_id, severity: alertDefinition.severity, triggeredAt: savedLog.triggered_at } };
      await this.messageProducerService.sendMessage('broadcast_notification', broadcastPayload);
      this.logger.log(`Emitted 'broadcast_notification' event for alert ${alertId}.`);
    } else {
      const adminSubscriptions = await this.adminSubscriptionRepository.find({ where: { alert_id: alertId, is_active: true } });
      const userSubscriptions = await this.userSubscriptionRepository.find({ where: { alert_id: alertId, is_active: true } });
      const adminRecipientIds = adminSubscriptions.map(sub => sub.admin_id);
      const userRecipientIds = userSubscriptions.map(sub => sub.user_id);
      const allRecipientIds = [...adminRecipientIds, ...userRecipientIds];
      if (allRecipientIds.length === 0) {
        this.logger.warn(`No active subscribers (admins or users) found for alert ${alertId}. No notification will be sent.`);
        return savedLog;
      }
      const selectivePayload = { recipientUserIds: allRecipientIds, title: alertDefinition.title, message: message, metadata: { alertId: alertId, alertLogId: savedLog.alert_log_id, relatedEntityId: relatedEntityId, severity: alertDefinition.severity, triggeredAt: savedLog.triggered_at } };
      await this.messageProducerService.sendMessage('selective_notification', selectivePayload);
      this.logger.log(`Emitted 'selective_notification' event for ${allRecipientIds.length} subscribers for alert ${alertId}.`);
    }
    return savedLog;
  }
  async findLogs(queryDto: GetAlertLogsQueryDto): Promise<{ data: AdminAlertLog[], total: number, page: number, limit: number }> {
    const { page = 1, limit = 10, alert_type, severity, startDate, endDate } = queryDto;
    const skip = (page - 1) * limit;
    const query = this.adminAlertLogRepository.createQueryBuilder('log').leftJoinAndSelect('log.alert', 'alertDefinition');
    if (alert_type) { query.andWhere('alertDefinition.alert_type = :alert_type', { alert_type }); }
    if (severity) { query.andWhere('alertDefinition.severity = :severity', { severity }); }
    if (startDate) { query.andWhere('log.triggered_at >= :startDate', { startDate }); }
    if (endDate) { query.andWhere('log.triggered_at <= :endDate', { endDate }); }
    const [data, total] = await query.orderBy('log.triggered_at', 'DESC').skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }
  async findAdminSubscriptions(alertId: string): Promise<AdminAlertSubscription[]> {
    return this.adminSubscriptionRepository.find({ where: { alert_id: alertId } });
  }
  async removeAdminSubscription(alertId: string, adminId: string): Promise<{ message: string }> {
    const result = await this.adminSubscriptionRepository.delete({ alert_id: alertId, admin_id: adminId });
    if (result.affected === 0) { throw new NotFoundException(`Subscription for admin ${adminId} on alert ${alertId} not found.`); }
    return { message: 'Admin subscription successfully removed.' };
  }
  async addUserSubscription(alertId: string, userId: string): Promise<UserAlertSubscription> {
    await this.findOne(alertId);
    const existingSub = await this.userSubscriptionRepository.findOneBy({ alert_id: alertId, user_id: userId });
    if (existingSub) { throw new ConflictException(`User ${userId} is already subscribed to alert ${alertId}.`); }
    const newSub = this.userSubscriptionRepository.create({ alert_id: alertId, user_id: userId });
    return this.userSubscriptionRepository.save(newSub);
  }
  async findUserSubscriptions(alertId: string): Promise<UserAlertSubscription[]> {
    return this.userSubscriptionRepository.find({ where: { alert_id: alertId } });
  }
  async removeUserSubscription(alertId: string, userId: string): Promise<{ message: string }> {
    const result = await this.userSubscriptionRepository.delete({ alert_id: alertId, user_id: userId });
    if (result.affected === 0) { throw new NotFoundException(`Subscription for user ${userId} on alert ${alertId} not found.`); }
    return { message: 'User subscription successfully removed.' };
  }
  async create(createDto: CreateAdminAlertDto): Promise<AdminAlert> {
    const newAlert = this.adminAlertRepository.create(createDto);
    return this.adminAlertRepository.save(newAlert);
  }
  async findAll(): Promise<AdminAlert[]> {
    return this.adminAlertRepository.find();
  }
  async findOne(alertId: string): Promise<AdminAlert> {
    const alert = await this.adminAlertRepository.findOneBy({ alert_id: alertId });
    if (!alert) { throw new NotFoundException(`Alert definition with ID ${alertId} not found.`); }
    return alert;
  }
  async update(alertId: string, updateDto: UpdateAdminAlertDto): Promise<AdminAlert> {
    const alert = await this.findOne(alertId);
    const updatedAlert = this.adminAlertRepository.merge(alert, updateDto);
    return this.adminAlertRepository.save(updatedAlert);
  }
  async deactivate(alertId: string): Promise<{ message: string }> {
    const alert = await this.findOne(alertId);
    alert.is_active = false;
    await this.adminAlertRepository.save(alert);
    return { message: `Alert definition ${alertId} has been deactivated.` };
  }
}