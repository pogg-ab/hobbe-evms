import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BankAccounts } from 'src/domain/entities/bank_accounts.entity';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CreateBankAccountDto } from 'src/presentation/dtos/bank-accounts/create-bank-acounts.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('bank-accounts')
@ApiTags('Bank Accounts')
export class BanksController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
      ) {}
    // Add Bank Account related endpoints here
    
    @ApiBody({ type: CreateBankAccountDto })
    @ApiOperation({ description: 'Get All Bank Accounts Of Event' })
    @HttpCode(200)

    @Get(':event_id')
    @Roles('User')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getNewBankAccount(
      @Param('event_id') evet_id: string,
    ): Promise<{ message: string; accounts: BankAccounts[] }> {
     
    //   const command = new CreateEventCommand(createBankAccountDto);
    //   const createdBankAccount = await this.commandBus.execute(command);
    //   return { message: 'Event created successfully', account: createdBankAccount };
    return ;
    }
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
      @Param('event_id') evet_id: string,
      @Body() createBankAccountDto: CreateBankAccountDto,
    ): Promise<{ message: string; account: BankAccounts }> {

        console.log(createBankAccountDto);
        
     
    //   const command = new CreateEventCommand(createBankAccountDto);
    //   const createdBankAccount = await this.commandBus.execute(command);
    //   return { message: 'Event created successfully', account: createdBankAccount };
    return ;
    
    }


    @ApiOperation({ description: 'Get Single Bank Account' })
    @HttpCode(200)
    @Get(':id')
    @Roles('User')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findOne(
      @Param('id') id: number,
    ): Promise<{ message: string; account: BankAccounts }> {
     
    //   const command = new CreateEventCommand(createBankAccountDto);
    //   const createdBankAccount = await this.commandBus.execute(command);
    //   return { message: 'Event created successfully', account: createdBankAccount };
    return ;
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

    
}
