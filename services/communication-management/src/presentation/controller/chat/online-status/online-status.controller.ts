import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { OnlineStatusService } from 'src/application/services/chat/online-status-service/online-status-service';

@Controller('online-status')
export class OnlineStatusController {
    constructor(private readonly onlineStatusService: OnlineStatusService) {}

  @Post('update/:userId')
  async updateOnlineStatus(
    @Param('userId') userId: string,
    @Body() body: { isOnline: boolean, lastSeen: number },
  ) {
    const { isOnline, lastSeen } = body;
    await this.onlineStatusService.updateOnlineStatus(userId, isOnline, lastSeen);
    return { message: 'Online status updated successfully' };
  }

  @Get(':userId')
  async getOnlineStatus(@Param('userId') userId: string) {
    const status = await this.onlineStatusService.getOnlineStatus(userId);
    return status ? status : { message: 'No online status found for this user' };
  }
}
