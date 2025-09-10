import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Headers,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import {
  CreateChapaPayoutDto,
  ChapaPayoutResponseDto,
  PayoutStatusResponseDto,
} from 'src/presentation/dtos/chapa/create-chapa-payout.dto';
import { Logger } from '@nestjs/common';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@ApiTags('Chapa Payouts')
@Controller('chapa/payouts')
@ApiBearerAuth('access-token')
@UseInterceptors(AuditLogInterceptor)
// @Roles('User')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class ChapaPayoutsController {
  // private readonly logger = new Logger(ChapaPayoutsController.name);

  // constructor(private readonly chapaService: ChapaSDKService) {}

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({
  //   summary: 'Initiate a new payout',
  //   description: 'Initiates a new payout to the specified beneficiary. Supports both bank transfers and mobile money payouts.'
  // })
  // @ApiBody({
  //   type: CreateChapaPayoutDto,
  //   examples: {
  //     bankTransfer: {
  //       summary: 'Bank Transfer Example',
  //       value: {
  //         amount: 1500,
  //         currency: 'ETB',
  //         reference: 'payout-987654321',
  //         description: 'Vendor payment for September',
  //         method: 'bank_account',
  //         beneficiary: {

  //          mobile_money_provider: 'telebirr',
  //     account_number: '0934515656',
  //     account_name: 'HuBB',
  //     bank_code: '855'
  //         },
  //         example: 'https://54f259c686fe.ngrok-free.app/webhooks/chapa', 
  //       }
  //     },
  //     mobileMoney: {
  //       summary: 'Mobile Money Example',
  //       value: {
  //         amount: 500,
  //         currency: 'ETB',
  //         reference: 'payout-123456789',
  //         description: 'Freelancer payment',
  //         method: 'mobile_money',
  //         beneficiary: {
  //           account_number: '0912345678',
  //           account_name: 'Jane Smith',
  //           mobile_money_provider: 'telebirr'
  //         }
  //       }
  //     }
  //   }
  // })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Payout initiated successfully',
  //   type: ChapaPayoutResponseDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid input or payout failed',
  //   schema: {
  //     example: {
  //       statusCode: 400,
  //       message: 'Bank code is required for bank transfers',
  //       error: 'Bad Request'
  //     }
  //   }
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Not authenticated',
  // })
  // @ApiResponse({
  //   status: HttpStatus.TOO_MANY_REQUESTS,
  //   description: 'Too many requests',
  // })
  // async createPayout(
  //   @Body() createPayoutDto: CreateChapaPayoutDto,
  // ): Promise<ChapaPayoutResponseDto> {
  //   try {
  //     return await this.chapaService.createPayout(createPayoutDto);
  //   } catch (error) {
  //     this.logger.error('Failed to create payout', error.stack);
  //     throw error; // Let the global exception filter handle it
  //   }
  // }

  // @Get(':reference')
  // @ApiOperation({
  //   summary: 'Get payout status by reference',
  //   description: 'Retrieves the current status of a payout using its unique reference.'
  // })
  // @ApiParam({
  //   name: 'reference',
  //   description: 'The unique reference of the payout',
  //   example: 'payout-1234567890',
  //   type: 'string'
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Payout status retrieved successfully',
  //   type: PayoutStatusResponseDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Payout not found',
  //   schema: {
  //     example: {
  //       statusCode: 404,
  //       message: 'Payout with reference payout-1234567890 not found',
  //       error: 'Not Found'
  //     }
  //   }
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Not authenticated',
  // })
  // async getPayoutStatus(
  //   @Param('reference') reference: string,
  // ): Promise<PayoutStatusResponseDto> {
  //   try {
  //     return await this.chapaService.getPayoutStatus(reference);
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to get status for payout ${reference}`,
  //       error.stack,
  //     );
  //     throw error;
  //   }
  // }

  // @Get()
  // @ApiOperation({
  //   summary: 'List payouts with optional filtering',
  //   description: 'Retrieves a paginated list of payouts with optional status filtering.'
  // })
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   description: 'Page number (1-based)', 
  //   type: Number,
  //   example: 1,
  //   schema: {
  //     default: 1,
  //     minimum: 1
  //   }
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Items per page (max 100)',
  //   type: Number,
  //   example: 20,
  //   schema: {
  //     default: 20,
  //     minimum: 1,
  //     maximum: 100
  //   }
  // })
  // @ApiQuery({
  //   name: 'status',
  //   required: false,
  //   description: 'Filter payouts by status',
  //   enum: ['pending', 'processing', 'completed', 'failed'],
  //   example: 'completed'
  // })
  // @ApiQuery({
  //   name: 'startDate',
  //   required: false,
  //   description: 'Filter payouts created after this date (ISO 8601 format)',
  //   type: String,
  //   example: '2025-01-01T00:00:00.000Z'
  // })
  // @ApiQuery({
  //   name: 'endDate',
  //   required: false,
  //   description: 'Filter payouts created before this date (ISO 8601 format)',
  //   type: String,
  //   example: '2025-12-31T23:59:59.999Z'
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Payouts retrieved successfully',
  // })
  // async listPayouts(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 50,
  //   @Query('status') status?: string,
  // ) {
  //   try {
  //     return await this.chapaService.listPayouts(
  //       Number(page),
  //       Math.min(Number(limit), 100), // Ensure limit doesn't exceed 100
  //       status,
  //     );
  //   } catch (error) {
  //     this.logger.error('Failed to list payouts', error.stack);
  //     throw error;
  //   }
  // }

  // @Post('webhook')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Handle Chapa payout webhook',
  //   description: 'This endpoint receives webhook events from Chapa for payout status updates.'
  // })
  // @ApiHeader({
  //   name: 'x-chapa-signature',
  //   description: 'HMAC SHA256 signature for webhook verification',
  //   required: true,
  //   example: 'sha256=...'
  // })
  // @ApiBody({
  //   description: 'Webhook payload from Chapa',
  //   examples: {
  //     completed: {
  //       summary: 'Completed Payout',
  //       value: {
  //         event: 'transfer.completed',
  //         data: {
  //           id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  //           reference: 'payout-1234567890',
  //           amount: 1000,
  //           currency: 'ETB',
  //           status: 'completed',
  //           fee: 10.5,
  //           created_at: '2025-09-09T10:00:00.000Z',
  //           updated_at: '2025-09-09T10:05:00.000Z',
  //           completed_at: '2025-09-09T10:05:00.000Z',
  //           beneficiary: {
  //             account_number: '1000138985597',
  //             account_name: 'John Doe',
  //             bank_code: '013'
  //           }
  //         }
  //       }
  //     },
  //     failed: {
  //       summary: 'Failed Payout',
  //       value: {
  //         event: 'transfer.failed',
  //         data: {
  //           id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  //           reference: 'payout-1234567890',
  //           amount: 1000,
  //           currency: 'ETB',
  //           status: 'failed',
  //           fee: 0,
  //           created_at: '2025-09-09T10:00:00.000Z',
  //           updated_at: '2025-09-09T10:05:00.000Z',
  //           failure_reason: 'Insufficient funds',
  //           beneficiary: {
  //             account_number: '1000138985597',
  //             account_name: 'John Doe',
  //             bank_code: '013'
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Webhook processed successfully',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid webhook payload or signature',
  // })
  // async handleWebhook(
  //   @Body() payload: any,
  //   @Headers('x-chapa-signature') signature: string,
  // ) {
  //   if (!signature) {
  //     throw new BadRequestException('Missing signature header');
  //   }

  //   try {
  //     return await this.chapaService.handlePayoutWebhook(payload, signature);
  //   } catch (error) {
  //     this.logger.error('Failed to process webhook', error.stack);
  //     throw error;
  //   }
  // }
}
