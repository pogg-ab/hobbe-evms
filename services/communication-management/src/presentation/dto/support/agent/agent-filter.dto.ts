import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class AgentFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by email address',
    example: 'superman@freshdesk.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by mobile number',
    example: '7654367287',
  })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({
    description: 'Filter by phone number',
    example: '4352789885',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by agent state',
    example: 'fulltime',
    enum: ['fulltime', 'occasional'],
  })
  @IsOptional()
  @IsIn(['fulltime', 'occasional'])
  state?: 'fulltime' | 'occasional';
}
