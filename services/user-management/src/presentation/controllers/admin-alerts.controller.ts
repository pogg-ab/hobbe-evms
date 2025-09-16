import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AdminAlertsService } from 'src/application/services/admin-alerts.service';
import { AdminAlert } from 'src/domain/entities/admin-alert.entity';
import { AdminAlertLog } from 'src/domain/entities/admin-alert-log.entity';
import { Permissions } from '../decorators/permissions.decorator';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { SessionGuard } from '../guards/session.guard';
import { CreateAdminAlertDto } from '../dtos/admin-alerts/create-admin-alert.dto';
import { UpdateAdminAlertDto } from '../dtos/admin-alerts/update-admin-alert.dto';
import { GetAlertLogsQueryDto } from '../dtos/admin-alerts/get-alert-logs-query.dto';
import { CreateAdminSubscriptionDto } from '../dtos/admin-alerts/create-admin-subscription.dto';
import { CreateUserSubscriptionDto } from '../dtos/admin-alerts/create-user-subscription.dto';
import { AdminAlertSubscription } from 'src/domain/entities/admin-alert-subscription.entity';
import { UserAlertSubscription } from 'src/domain/entities/user-alert-subscription.entity';

class TriggerAlertDto {
  @IsString() message: string;
  @IsString() @IsOptional() relatedEntityId?: string;
}

@ApiTags('Admin - Alert Management')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, SessionGuard, PermissionsGuard)
@Controller('admin/alerts')
export class AdminAlertsController {
  constructor(private readonly adminAlertsService: AdminAlertsService) {}

  // --- CRUD FOR ALERT DEFINITIONS ---
  @Post()
  @Permissions('create:admin_alert:System')
  create(@Body() createDto: CreateAdminAlertDto): Promise<AdminAlert> {
    return this.adminAlertsService.create(createDto);
  }

  @Get()
  @Permissions('view:admin_alerts:System')
  findAll(): Promise<AdminAlert[]> {
    return this.adminAlertsService.findAll();
  }

  @Get(':id')
  @Permissions('view:admin_alerts:System')
  findOne(@Param('id') id: string): Promise<AdminAlert> {
    return this.adminAlertsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('update:admin_alert:System')
  update(@Param('id') id: string, @Body() updateDto: UpdateAdminAlertDto): Promise<AdminAlert> {
    return this.adminAlertsService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('delete:admin_alert:System')
  @HttpCode(200)
  deactivate(@Param('id') id: string): Promise<{ message: string }> {
    return this.adminAlertsService.deactivate(id);
  }

  // --- TRIGGERING AND LOGS ---
  @Post(':id/trigger')
  @Permissions('create:admin_alert:System')
  triggerAlert(@Param('id') id: string, @Body() triggerDto: TriggerAlertDto): Promise<AdminAlertLog> {
    return this.adminAlertsService.triggerAlert(id, triggerDto.message, triggerDto.relatedEntityId);
  }

  @Get('logs')
  @Permissions('view:admin_alerts:System')
  getLogs(@Query() queryDto: GetAlertLogsQueryDto): Promise<{ data: AdminAlertLog[], total: number, page: number, limit: number }> {
    return this.adminAlertsService.findLogs(queryDto);
  }
  
  // --- START: NEW SUBSCRIPTION ENDPOINTS ---

  // ADMIN SUBSCRIPTIONS
  @Post(':alertId/subscriptions')
  @Permissions('create:admin_alert:System') // Assuming Super Admin has this permission
  @ApiOperation({ summary: 'Subscribe an admin to an alert' })
  addAdminSubscription(@Param('alertId') alertId: string, @Body() dto: CreateAdminSubscriptionDto): Promise<AdminAlertSubscription> {
    return this.adminAlertsService.addAdminSubscription(alertId, dto.adminId);
  }

  @Get(':alertId/subscriptions')
  @Permissions('view:admin_alerts:System')
  @ApiOperation({ summary: 'List admins subscribed to an alert' })
  findAdminSubscriptions(@Param('alertId') alertId: string): Promise<AdminAlertSubscription[]> {
    return this.adminAlertsService.findAdminSubscriptions(alertId);
  }

  @Delete(':alertId/subscriptions/:adminId')
  @Permissions('delete:admin_alert:System')
  @ApiOperation({ summary: 'Unsubscribe an admin from an alert' })
  removeAdminSubscription(@Param('alertId') alertId: string, @Param('adminId') adminId: string): Promise<{ message: string }> {
    return this.adminAlertsService.removeAdminSubscription(alertId, adminId);
  }
  
  // USER SUBSCRIPTIONS
  @Post(':alertId/user-subscriptions')
  @Permissions('create:admin_alert:System')
  @ApiOperation({ summary: 'Subscribe a regular user to an alert' })
  addUserSubscription(@Param('alertId') alertId: string, @Body() dto: CreateUserSubscriptionDto): Promise<UserAlertSubscription> {
    return this.adminAlertsService.addUserSubscription(alertId, dto.userId);
  }

  @Get(':alertId/user-subscriptions')
  @Permissions('view:admin_alerts:System')
  @ApiOperation({ summary: 'List users subscribed to an alert' })
  findUserSubscriptions(@Param('alertId') alertId: string): Promise<UserAlertSubscription[]> {
    return this.adminAlertsService.findUserSubscriptions(alertId);
  }

  @Delete(':alertId/user-subscriptions/:userId')
  @Permissions('delete:admin_alert:System')
  @ApiOperation({ summary: 'Unsubscribe a user from an alert' })
  removeUserSubscription(@Param('alertId') alertId: string, @Param('userId') userId: string): Promise<{ message: string }> {
    return this.adminAlertsService.removeUserSubscription(alertId, userId);
  }
  
 
}