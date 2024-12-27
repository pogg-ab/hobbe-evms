import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBankAccountCommand } from 'src/application/commands/bank-accounts/create.bank-account.command';
import { FindBankAccountByEventQuery } from 'src/application/queries/bank-accounts/find-by-event.query';
import { FindOneBankAccountQuery } from 'src/application/queries/bank-accounts/find-one.query';
import { BankAccounts } from 'src/domain/entities/bank_accounts.entity';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CreateBankAccountDto } from 'src/presentation/dtos/bank-accounts/create-bank-acounts.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('bank-accounts')
@ApiTags('Bank Accounts')
export class BankAccountsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
      ) {}
    
    @ApiBody({ type: CreateBankAccountDto })
    @ApiOperation({ description: 'Add New Bank Account' })
    @HttpCode(200)
    @ApiResponse({
      type: CreateBankAccountDto,
    })
    @Post(':event_id')
    // @Roles('User')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    async createNewBankAccount(
      @Param('event_id') event_id: string,
      @Body() createBankAccountDto: CreateBankAccountDto,
      @CurrentUserId() user: any,
    ): Promise<{ message: string; account: BankAccounts }> {     
      const command = new CreateBankAccountCommand(user,event_id,createBankAccountDto);
      const createdBankAccount = await this.commandBus.execute(command);
      return { message: 'Bank Account created successfully', account: createdBankAccount };   
    }


    @ApiOperation({ description: 'Get Single Bank Account' })
    @HttpCode(200)
    @Get(':id')
    // @Roles('User')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    async findOne(
      @Param('id') id: string,
    ): Promise<BankAccounts | null> {
      const query = new FindOneBankAccountQuery(id);
      return await this.queryBus.execute(query);
    }

    @ApiBody({ type: CreateBankAccountDto })
    @ApiOperation({ description: 'Update Bank Account' })
    @HttpCode(200)
    @ApiResponse({
      type: CreateBankAccountDto,
    })
    @Patch(':id')
    @Roles('User')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateBankAccount(
      @Param('id') id: string,
      @Body() createBankAccountDto: CreateBankAccountDto,
    ): Promise<{ message: string; account: BankAccounts }> {
     
    //   const command = new CreateEventCommand(createBankAccountDto);
    //   const createdBankAccount = await this.commandBus.execute(command);
    //   return { message: 'Event created successfully', account: createdBankAccount };
    return ;
    
    }


    @ApiOperation({ description: 'Remove Single Bank Account' })
    @HttpCode(200)
    @Delete(':id')
    @Roles('User')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async delete(
      @Param('id') id: number,
    ): Promise<{ message: string; }> {
     
    //   const command = new CreateEventCommand(createBankAccountDto);
    //   const createdBankAccount = await this.commandBus.execute(command);
    //   return { message: 'Event created successfully', account: createdBankAccount };
    return ;
    }



    @ApiOperation({ description: 'Get All Bank Accounts Of Event' })
    @HttpCode(200)
    @Get('/event/:event_id')
    // @Roles('User')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    async getNewBankAccount(
      @Param('event_id') event_id: string,
    ): Promise<{ message: string; accounts: BankAccounts[] }> {
      const query = new FindBankAccountByEventQuery(event_id);
      return await this.queryBus.execute(query);
    }

    
}
