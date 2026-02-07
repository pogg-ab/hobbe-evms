import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SystemSettingsService } from 'src/application/services/system-settings.service';
import { UpdateMfaSettingDto } from '../dtos/update-system-setting.dto';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';

@ApiTags('Admin - System Settings')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('admin/system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get('mfa')
  @ApiOperation({ summary: 'Get the current system-wide MFA requirement' })
  @ApiResponse({ status: 200, description: 'Returns the current MFA setting.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User lacks the required permission.',
  })
  @Permissions('update:system_settings:System')
  async getMfaSetting() {
    return this.systemSettingsService.getMfaRequirement();
  }

  @Patch('mfa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the system-wide MFA requirement' })
  @ApiBody({ type: UpdateMfaSettingDto })
  @ApiResponse({
    status: 200,
    description: 'MFA setting updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User lacks the required permission.',
  })
  @Permissions('update:system_settings:System')
  async updateMfaSetting(@Body() updateMfaSettingDto: UpdateMfaSettingDto) {
    const updatedSetting =
      await this.systemSettingsService.updateMfaRequirement(
        updateMfaSettingDto.isEnabled,
      );
    return {
      message: 'System-wide MFA requirement has been updated successfully.',
      setting: updatedSetting,
    };
  }
}
