
import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { RequestVerificationDto } from '../dtos/request-verification.dto';
import { ReviewVerificationDto } from '../dtos/review-verification.dto';
import { VerificationResponseDto } from '../dtos/verification-response.dto';
import { CurrentUserId } from '../decorators/currentUserId.decorater';
import { Roles } from '../decorators/roles.decorator';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestVerificationCommand } from '../../application/commands/verificiation/request-verification.command';
import { CancelVerificationCommand } from '../../application/commands/verificiation/cancel-verification.command';
import { ReviewVerificationCommand } from '../../application/commands/verificiation/review-verification.command';
import { UnverifyAccountCommand } from '../../application/commands/verificiation/unverify-account.command';
import { ListPendingVerificationsQuery } from '../../application/queries/verification/list-pending-verification';
import { FileInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { multerConfig } from '../../infrastructure/file-upload/multer.config';
import { PermissionsGuard } from '../guards/permissions.guard';
import path from 'path';
import * as fs from 'fs-extra';

@ApiTags('Verifications')
@ApiBearerAuth()
@Controller('verifications')
export class VerificationController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

async getIdFromPayload(payload: any): Promise<string> {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try { return JSON.parse(payload)?.admin_user_id ?? payload; } catch { return payload; }
  }
  // payload is an object:
  return payload.admin_user_id ?? payload.user?.user_id ?? payload.sub ?? null;
}


@UseInterceptors(FileInterceptor('nationalIdImage', multerConfig('national_id') as any))
@Post('request/upload')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Request verification for current user (multipart upload)' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      reason: { type: 'string', example: 'I am a public speaker and need verification' },
      nationalIdImage: { type: 'string', format: 'binary' },
    },
    required: ['reason', 'nationalIdImage'],
  },
})
async requestVerificationMultipart(
  @UploadedFile() file: any,
  @Body() rawBody: any,
//   @CurrentUserId() currentUserId: string,
  @CurrentUserId() userPayload: any,
) {
    console.log('current-user', userPayload)
    const currentUserId = userPayload.user.user_id;
  try {
    // Defensive checks
    if (!file) {
      throw new BadRequestException('nationalIdImage file is required');
    }
    if (!file.filename) {
      if (file.path) {
        try { await fs.remove(file.path); } catch (_) {}
      }
      throw new BadRequestException('Uploaded file is invalid (missing filename)');
    }

    const uploadedRelativePath = `/uploads/national_id/${file.filename}`;

    const dtoPlain = {
      reason: rawBody?.reason,
      nationalIdImage: uploadedRelativePath,
    };

    // Validate AFTER attaching file path
    const dtoInstance = plainToInstance(RequestVerificationDto, dtoPlain);
    const errors = await validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: false });

    if (errors.length > 0) {
      const formatted = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      // cleanup uploaded file on validation failure
      try { await fs.remove(file.path); } catch (_) {}
      throw new BadRequestException(formatted);
    }

    // Everything ok -> dispatch command
    return this.commandBus.execute(new RequestVerificationCommand(currentUserId, dtoInstance));
  } catch (err) {
    if (err instanceof BadRequestException) throw err;
    throw new InternalServerErrorException(err.message || 'Failed to process upload');
  }
}

  // -------------------------
  // Cancel (user)
  // -------------------------
  @ApiOperation({ summary: 'Cancel pending verification request for current user' })
  @ApiResponse({ status: 200, description: 'Verification request canceled', type: VerificationResponseDto })
  @ApiBadRequestResponse({ description: 'No pending request found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete('cancel')
  async cancelVerification(@CurrentUserId() userPayload: any) {
    const currentUserId = userPayload.user.user_id;
    return this.commandBus.execute(new CancelVerificationCommand(currentUserId));
  }

  // Admin endpoints protected by AdminAuthGuard + RolesGuard
  @ApiOperation({ summary: 'List all pending verification requests (admin)' })
  @ApiResponse({ status: 200, description: 'List of pending verification requests', type: [VerificationResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @Permissions('update:Event')
  @Get('pending')
  async listPending() {
    return this.queryBus.execute(new ListPendingVerificationsQuery());
  }

  @ApiOperation({ summary: 'Review a verification request (approve/reject) (admin)' })
  @ApiParam({ name: 'id', description: 'verification request id', type: 'string', required: true })
  @ApiBody({ type: ReviewVerificationDto })
  @ApiResponse({ status: 200, description: 'Review saved', type: VerificationResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid decision or non-pending request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @Permissions('update:Event')
  @Patch('review/:id')
  async reviewRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewVerificationDto,
    @CurrentUserId() userPayload: string,
  ) {  
     const adminId = this.getIdFromPayload(userPayload);
  if (!adminId) throw new BadRequestException('Unable to resolve admin id');

    return this.commandBus.execute(
      new ReviewVerificationCommand(await adminId, id, { decision: dto.decision, rejectionReason: dto.rejectionReason }),
    );
  }

  @ApiOperation({ summary: 'Unverify an account (admin)' })
  @ApiParam({ name: 'personalAccountId', description: 'personal account id', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Account unverifed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @Permissions('update:Event')
  @Patch('unverify/:personalAccountId')
  async unverify(
    @Param('personalAccountId', ParseUUIDPipe) personalAccountId: string, 
    @CurrentUserId() userPayload: string
  ) {
     const adminId = this.getIdFromPayload(userPayload);
    if (!adminId) throw new BadRequestException('Unable to resolve admin id');
    return this.commandBus.execute(new UnverifyAccountCommand(await adminId, personalAccountId));
  }
}

