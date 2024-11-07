import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { OrganizationalAccountService } from '../../application/services/organizational-account.service';
import { CreateOrganizationalAccountDto } from '../dtos/create-organizational-account.dto';
import { UpdateOrganizationalAccountDto } from '../dtos/update-organizational-account.dto';

@ApiTags('Organizational Account')
@Controller('organizational-account')
export class OrganizationalAccountController {
  constructor(
    private readonly organizationalAccountService: OrganizationalAccountService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organizational account' })
  @ApiBody({ type: CreateOrganizationalAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Organizational account created successfully',
    type: OrganizationalAccount,
  })
  create(
    @Body() createOrganizationalAccountDto: CreateOrganizationalAccountDto,
  ) {
    return this.organizationalAccountService.create(
      createOrganizationalAccountDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizational accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all organizational accounts',
    type: [OrganizationalAccount],
  })
  findAll() {
    return this.organizationalAccountService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an organizational account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Organizational account found',
    type: OrganizationalAccount,
  })
  @ApiResponse({
    status: 404,
    description: 'Organizational account not found',
  })
  findOne(@Param('id') id: string) {
    return this.organizationalAccountService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing organizational account' })
  @ApiBody({ type: UpdateOrganizationalAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Organizational account updated successfully',
    type: OrganizationalAccount,
  })
  @ApiResponse({
    status: 404,
    description: 'Organizational account not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ) {
    return this.organizationalAccountService.update(
      +id,
      updateOrganizationalAccountDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organizational account' })
  @ApiResponse({
    status: 204,
    description: 'Organizational account deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Organizational account not found',
  })
  remove(@Param('id') id: string) {
    return this.organizationalAccountService.remove(+id);
  }
}
