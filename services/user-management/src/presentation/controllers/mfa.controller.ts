import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MfaService } from 'src/application/services/mfa.service';
// --- IMPORT THE NEW GUARD ---
import { UniversalAuthGuard } from '../guards/universal-auth.guard';
import { EnableMfaDto } from '../dtos/enable-mfa.dto';

@ApiTags('MFA')
// Use the 'access-token' scheme name that we know works in Swagger
@ApiBearerAuth('access-token') 
// --- USE THE NEW GUARD ---
@UseGuards(UniversalAuthGuard) 
@Controller('mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new QR code for MFA setup' })
  @ApiResponse({ status: 201, description: 'QR code generated successfully.' })
  @ApiResponse({ status: 400, description: 'MFA is already enabled.' })
  async generateMfaQrCode(@Req() req) {
    // req.user will now be populated by whichever strategy succeeded.
    const payload = req.user;
    
    // We need to reliably get the user ID and email from the payload.
    // The admin payload has `admin_user_id` and the user payload from your strategy has `user.user_id`.
    // Let's standardize this.
    const userId = payload.admin_user_id || payload.user?.user_id;
    const email = payload.user_name || payload.user?.user_name;
    const isAdmin = payload.permissions !== undefined;
    
    return this.mfaService.generateMfaSetup(userId.toString(), email, isAdmin);
  }

  @Post('enable')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify a token and enable MFA' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid authentication code.' })
  async enableMfa(@Req() req, @Body() enableMfaDto: EnableMfaDto) {
    const payload = req.user;
    const userId = payload.admin_user_id || payload.user?.user_id;

    return this.mfaService.verifyAndEnableMfa(userId.toString(), enableMfaDto.token);
  }
}