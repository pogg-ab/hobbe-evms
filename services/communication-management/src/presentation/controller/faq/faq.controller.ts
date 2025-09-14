
// src/presentation/controllers/faq.controller.ts
import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, Delete, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFaqDto } from '../../dto/faq/create-faq.dto';
import { UpdateFaqDto } from '../../dto/faq/update-faq.dto';
import { CurrentUserId } from '../../decorators/currentUserId.decorater';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';
import { CreateFaqCommand } from '../../../application/commands/faq/create-faq.command';
import { UpdateFaqCommand } from '../../../application/commands/faq/update-faq.command';
import { DeleteFaqCommand } from '../../../application/commands/faq/delete-faq.command';
import { GetFaqQuery } from '../../../application/queries/faq/get-faq.query';
import { ListFaqsQuery } from '../../../application/queries/faq/list-faqs.query';

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
  @ApiResponse({
    status: 200,
    description: 'List of FAQs with total count',
    schema: {
      example: {
        items: [
          {
            id: 'd0b7d4c3-4329-4df8-87f6-12efb1a83a9e',
            title: 'How do I reset my password?',
            content: 'You can reset your password by going to Settings > Security.',
            tags: ['account', 'security'],
            created_by: 'admin-user-uuid',
            created_at: '2025-09-13T10:15:30.000Z',
            updated_at: '2025-09-13T10:15:30.000Z',
          },
        ],
        count: 1,
      },
    },
  })
  async list(@Query('search') search?: string, @Query('tags') tagsStr?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : undefined;
    const result = await this.queryBus.execute(new ListFaqsQuery({ search, tags, page: page as any, limit: limit as any }));
    return { items: result[0], count: result[1] };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    description: 'FAQ retrieved',
    schema: {
      example: {
        id: 'd0b7d4c3-4329-4df8-87f6-12efb1a83a9e',
        title: 'How do I reset my password?',
        content: 'You can reset your password by going to Settings > Security.',
        tags: ['account', 'security'],
        created_by: 'admin-user-uuid',
        created_at: '2025-09-13T10:15:30.000Z',
        updated_at: '2025-09-13T10:15:30.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
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
  @ApiBody({
    schema: {
      example: {
        title: 'How do I reset my password?',
        content: 'You can reset your password by going to Settings > Security.',
        tags: ['account', 'security'],
      },
    },
    type: CreateFaqDto,
  })
  @ApiResponse({
    status: 201,
    description: 'FAQ created',
    schema: {
      example: {
        message: 'FAQ created successfully',
        data: {
          id: 'd0b7d4c3-4329-4df8-87f6-12efb1a83a9e',
          title: 'How do I reset my password?',
          content: 'You can reset your password by going to Settings > Security.',
          tags: ['account', 'security'],
          created_by: 'admin-user-uuid',
          created_at: '2025-09-13T10:15:30.000Z',
          updated_at: '2025-09-13T10:15:30.000Z',
        },
      },
    },
  })
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
  @ApiBody({
    schema: {
      example: {
        title: 'How do I change my email?',
        content: 'You can change your email by going to Settings > Account.',
        tags: ['account', 'email'],
      },
    },
    type: UpdateFaqDto,
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ updated',
    schema: {
      example: {
        message: 'FAQ updated successfully',
        data: {
          id: 'd0b7d4c3-4329-4df8-87f6-12efb1a83a9e',
          title: 'How do I change my email?',
          content: 'You can change your email by going to Settings > Account.',
          tags: ['account', 'email'],
          created_by: 'admin-user-uuid',
          created_at: '2025-09-13T10:15:30.000Z',
          updated_at: '2025-09-13T10:20:00.000Z',
        },
      },
    },
  })
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

