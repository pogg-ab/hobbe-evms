// src/presentation/controllers/faq.controller.ts
// import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, Delete, BadRequestException } from '@nestjs/common';
// import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
// import { FaqService } from '../../application/services/faq.service';
// import { CreateFaqDto } from '../dtos/create-faq.dto';
// import { UpdateFaqDto } from '../dtos/update-faq.dto';
// import { CurrentUserId } from '..//decorators/currentUserId.decorater';
// import { JwtAuthGuard } from '../guards/jwt-auth.guard';
// import { AdminAuthGuard } from '../guards/admin-auth.guard';
// import { PermissionsGuard } from '../guards/permissions.guard';
// import { Permissions } from '../decorators/permissions.decorator';

// @ApiTags('Support/FAQ')
// @Controller('support/faqs')
// export class FaqController {
//   constructor(private readonly faqService: FaqService) {}

//   async getIdFromPayload(payload: any): Promise<string> {
//   if (!payload) return null;
//   if (typeof payload === 'string') {
//     try { return JSON.parse(payload)?.admin_user_id ?? payload; } catch { return payload; }
//   }
//   // payload is an object:
//   return payload.admin_user_id ?? payload.user?.user_id ?? payload.sub ?? null;
// }

//   @Get()
//   @ApiOperation({ summary: 'List FAQs' })
//   @ApiQuery({ name: 'search', required: false })
//   @ApiQuery({ name: 'tags', required: false })
//   @ApiQuery({ name: 'page', required: false })
//   @ApiQuery({ name: 'limit', required: false })
//   async list(@Query('search') search?: string, @Query('tags') tagsStr?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
//     const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : undefined;
//     const [items, count] = await this.faqService.listFaqs({ search, tags, page: page as any, limit: limit as any });
//     return { items, count };
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Get FAQ by id' })
//   @ApiParam({ name: 'id' })
//   @ApiResponse({ status: 200, description: 'FAQ retrieved' })
//   async get(@Param('id') id: string) {
//     const item = await this.faqService.getFaqById(id);
//     if (!item) return { status: 404, message: 'FAQ not found' };
//     return item;
//   }

//   @Post()
//   @UseGuards(AdminAuthGuard, PermissionsGuard)
//   @ApiBearerAuth('access-token')
//   @Permissions('update:Event')
//   @ApiOperation({ summary: 'Create FAQ (admin)' })
//   @ApiBody({ type: CreateFaqDto })
//   async create(
//     @CurrentUserId() userPayload: string, 
//     @Body() dto: CreateFaqDto
//   ) {
//     const adminId = this.getIdFromPayload(userPayload);
//     if (!adminId) throw new BadRequestException('Unable to resolve admin id');
//     return this.faqService.createFaq(userId, dto);
//   }

//   @Put(':id')
//   @UseGuards(AdminAuthGuard, PermissionsGuard)
//   @ApiBearerAuth('access-token')
//   @Permissions('update:Event')
//   @ApiOperation({ summary: 'Update FAQ (admin)' })
//   @ApiParam({ name: 'id' })
//   @ApiBody({ type: UpdateFaqDto })
//   async update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
//     return this.faqService.updateFaq(id, dto);
//   }

//   @Delete(':id')
//   @UseGuards(AdminAuthGuard, PermissionsGuard)
//   @ApiBearerAuth('access-token')
//   @Permissions('update:Event')
//   @ApiOperation({ summary: 'Delete FAQ (admin)' })
//   @ApiParam({ name: 'id' })
//   @ApiResponse({ status: 200, description: 'FAQ deleted' })
//   async delete(@Param('id') id: string) {
//     await this.faqService.deleteFaq(id);
//     return { success: true };
//   }
// }


// src/presentation/controllers/faq.controller.ts
import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, Delete, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFaqDto } from '../dtos/create-faq.dto';
import { UpdateFaqDto } from '../dtos/update-faq.dto';
import { CurrentUserId } from '../decorators/currentUserId.decorater';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { CreateFaqCommand } from '../../application/commands/faq/create-faq.command';
import { UpdateFaqCommand } from '../../application/commands/faq/update-faq.command';
import { DeleteFaqCommand } from '../../application/commands/faq/delete-faq.command';
import { GetFaqQuery } from '../../application/queries/faq/get-faq.query';
import { ListFaqsQuery } from '../../application/queries/faq/list-faqs.query';

@ApiTags('Support / FAQ')
@Controller('support/faqs')
export class FaqController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    async getIdFromPayload(payload: any): Promise<string> {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try { return JSON.parse(payload)?.admin_user_id ?? payload; } catch { return payload; }
  }
  // payload is an object:
  return payload.admin_user_id ?? payload.user?.user_id ?? payload.sub ?? null;
}

  @Get()
  @ApiOperation({ summary: 'List FAQs' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tags', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async list(@Query('search') search?: string, @Query('tags') tagsStr?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : undefined;
    const result = await this.queryBus.execute(new ListFaqsQuery({ search, tags, page: page as any, limit: limit as any }));
    return { items: result[0], count: result[1] };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'FAQ retrieved' })
  async get(@Param('id') id: string) {
    const item = await this.queryBus.execute(new GetFaqQuery(id));
    if (!item) return { status: 404, message: 'FAQ not found' };
    return item;
  }

  @Post()
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @ApiBearerAuth('access-token')
  @Permissions('update:Event')
  @ApiOperation({ summary: 'Create FAQ (admin)' })
  @ApiBody({ type: CreateFaqDto })
  async create(
    @CurrentUserId()userPayload: string, 
    @Body() dto: CreateFaqDto
   ) {
    const adminId = this.getIdFromPayload(userPayload);
    if (!adminId) throw new BadRequestException('Unable to resolve admin id');
    return this.commandBus.execute(new CreateFaqCommand( await adminId, dto as any));
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @ApiBearerAuth('access-token')
  @Permissions('update:Event')
  @ApiOperation({ summary: 'Update FAQ (admin)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateFaqDto })
  async update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.commandBus.execute(new UpdateFaqCommand(id, dto as any));
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @ApiBearerAuth('access-token')
  @Permissions('update:Event')
  @ApiOperation({ summary: 'Delete FAQ (admin)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'FAQ deleted' })
  async delete(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteFaqCommand(id));
  }
}

