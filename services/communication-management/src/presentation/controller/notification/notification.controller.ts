// services/communication-management/src/application/controllers/notification.controller.ts

import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from 'src/application/services/notification/notification.service';
import { UniversalAuthGuard } from '../../guards/universal-auth.guard';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { UpdatePreferencesDto } from '../../dto/notification/update-preferences.dto';

// Helper classes for Swagger documentation (no changes needed here)
class NotificationResponse {
  id: string;
  type: string;
  message: string;
  status: string;
  metadata: Record<string, any>;
  created_at: Date;
}

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  @Get()
  @UseGuards(UniversalAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get the current user's notifications" })
  @ApiResponse({ status: 200, description: 'A list of notifications.', type: [NotificationResponse] })
  async getMyNotifications(@Req() req): Promise<NotificationResponse[]> {
    const userId = req.user.user.user_id; // CORRECTED
    return this.notificationService.findForUser(userId);
  }

  @Patch(':id/read')
  @UseGuards(UniversalAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.', type: NotificationResponse })
  @ApiResponse({ status: 404, description: 'Notification not found or does not belong to the user.' })
  async markNotificationAsRead(
    @Param('id') notificationId: string,
    @Req() req,
  ): Promise<NotificationResponse> {
    const userId = req.user.user.user_id; // CORRECTED
    const notification = await this.notificationService.markAsRead(notificationId, userId);
    
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }
    
    return notification;
  }

  @Get('preferences')
  @UseGuards(UniversalAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get the current user's notification preferences" })
  @ApiResponse({ status: 200, description: "A list of the user's saved preferences." })
  async getMyPreferences(@Req() req) {
    const userId = req.user.user.user_id; // CORRECTED
    return this.notificationService.getUserPreferences(userId);
  }
 
  @Patch('preferences')
  @UseGuards(UniversalAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(200)
  @ApiOperation({ summary: "Update the current user's notification preferences" })
  @ApiBody({ type: UpdatePreferencesDto })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully.' })
  async updateMyPreferences(
    @Req() req, 
    @Body() updatePreferencesDto: UpdatePreferencesDto
  ) {
    // THE FINAL FIX: Correctly access the nested user ID from the guard's payload
    const userId = req.user.user.user_id; // CORRECTED
    return this.notificationService.updateUserPreferences(userId, updatePreferencesDto.preferences);
  }

  @Delete(':id')
  @UseGuards(UniversalAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a specific notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Notification not found or does not belong to the user.' })
  async deleteNotification(
      @Param('id') notificationId: string,
      @Req() req,
  ): Promise<void> {
      const userId = req.user.user.user_id; // CORRECTED
      const wasDeleted = await this.notificationService.deleteNotification(notificationId, userId);

      if (!wasDeleted) {
          throw new NotFoundException('Notification not found or you do not have permission to delete it.');
      }
  }

  // Test emitter endpoint is commented out, no changes needed.
}