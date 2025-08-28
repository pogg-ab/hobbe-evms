import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MfaService } from 'src/application/services/mfa.service';
import { UniversalAuthGuard } from '../guards/universal-auth.guard';
import { EnableMfaDto } from '../dtos/enable-mfa.dto';
import { SessionGuard } from '../guards/session.guard';

@ApiTags('MFA')
@ApiBearerAuth('access-token')
@UseGuards(UniversalAuthGuard, SessionGuard)
@Controller('mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new QR code for MFA setup' })
  @ApiResponse({ status: 201, description: 'QR code generated successfully.' })
  @ApiResponse({ status: 400, description: 'MFA is already enabled.' })
  async generateMfaQrCode(@Req() req) {
    const payload = req.user;
    
    let userId: string;
    let email: string;
    let isAdmin: boolean;

    // This logic is correct and handles both user types.
    if (payload.admin_user_id) {
        userId = payload.admin_user_id.toString();
        email = payload.user_name; 
        isAdmin = true;
    } 
    else {
        userId = payload.user.user_id.toString();
        email = payload.user.user_name;
        isAdmin = false;
    }
    
    return this.mfaService.generateMfaSetup(userId, email, isAdmin);
  }

  @Post('enable')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify a token and enable MFA' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid authentication code.' })
  async enableMfa(@Req() req, @Body() enableMfaDto: EnableMfaDto) {
    const payload = req.user;
    
    // --- THIS IS THE FIX ---
    // We determine the user type and extract the ID, then pass the flag to the service.
    let userId: string;
    let isAdmin: boolean;

    if (payload.admin_user_id) {
        userId = payload.admin_user_id.toString();
        isAdmin = true;
    } else {
        userId = payload.user.user_id.toString();
        isAdmin = false;
    }

    return this.mfaService.verifyAndEnableMfa(userId, enableMfaDto.token, isAdmin);
  }
}