import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { WiseService } from 'src/application/services/payment-methods/wise/wise.service';

@Controller('wise')
export class WiseController {
  constructor(private readonly wiseService: WiseService) {}

  @ApiOperation({ description: 'Get Account Profile' })
  @HttpCode(200)
  @Get('profile')
  async getProfileId() {
    return this.wiseService.getProfileId();
  }

  @ApiOperation({ description: 'Quote' })
  @HttpCode(200)
  @Post('quote')
  async createQuote(
    @Body()
    body: {
      sourceCurrency: string;
      targetCurrency: string;
      amount: number;
    },
  ) {
    return this.wiseService.createQuote(
      body.sourceCurrency,
      body.targetCurrency,
      body.amount,
    );
  }

  @ApiOperation({ description: 'Transfer' })
  @HttpCode(200)
  @Post('transfer')
  async createTransfer(
    @Body() body: { targetAccountId: number; quoteId: string },
  ) {
    return this.wiseService.createTransfer(body.targetAccountId, body.quoteId);
  }

  @ApiOperation({ description: 'Fund Transfer' })
  @HttpCode(200)
  @Post('fund/:transferId')
  async fundTransfer(@Param('transferId') transferId: string) {
    return this.wiseService.fundTransfer(transferId);
  }

  @ApiOperation({ description: 'Get Transfer Status' })
  @HttpCode(200)
  @Get('status/:transferId')
  async getTransferStatus(@Param('transferId') transferId: string) {
    return this.wiseService.getTransferStatus(transferId);
  }
}
