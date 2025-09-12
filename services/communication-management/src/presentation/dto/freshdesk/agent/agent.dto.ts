// src/presentation/dtos/agent.dto.ts
import { IsString, IsEmail, IsBoolean, IsNumber, IsDate, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentDto {
    @ApiProperty({ description: 'Name of the agent', example: 'John Smith' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Email address of the agent', example: 'john.smith@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Role of the agent', example: 'Support Agent' })
    @IsString()
    @IsNotEmpty()
    role: string;

    @ApiProperty({ description: 'Initial availability status of the agent', example: true })
    @IsBoolean()
    available: boolean;
}

export class UpdateAgentDto {
    @ApiPropertyOptional({ description: 'Name of the agent', example: 'John Smith Updated' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Email address of the agent', example: 'john.updated@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Role of the agent', example: 'Senior Support Agent' })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional({ description: 'Availability status of the agent', example: false })
    @IsOptional()
    @IsBoolean()
    available?: boolean;
}

export class UpdateAgentAvailabilityDto {
    @ApiProperty({ description: 'Availability status of the agent', example: true })
    @IsBoolean()
    available: boolean;
}

export class AgentResponseDto {
    @ApiProperty({ description: 'Unique identifier of the agent', example: 5678 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'Name of the agent', example: 'John Smith' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Email address of the agent', example: 'john.smith@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Role of the agent', example: 'Support Agent' })
    @IsString()
    role: string;

    @ApiProperty({ description: 'Availability status of the agent', example: true })
    @IsBoolean()
    available: boolean;

    @ApiProperty({ description: 'Creation timestamp', example: '2023-01-15T10:30:00.000Z' })
    @IsDate()
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp', example: '2023-01-15T14:45:00.000Z' })
    @IsDate()
    updatedAt: Date;
}

export class AgentTimeReportResponseDto {
    @ApiProperty({ description: 'Agent ID', example: 5678 })
    @IsNumber()
    agentId: number;

    @ApiProperty({ description: 'Agent name', example: 'John Smith' })
    @IsString()
    agentName: string;

    @ApiProperty({ description: 'Total time spent in format "HH:MM"', example: '15:30' })
    @IsString()
    totalTime: string;

    @ApiProperty({ description: 'Billable time spent in format "HH:MM"', example: '12:45' })
    @IsString()
    billableTime: string;

    @ApiProperty({ description: 'Start date of the report period', example: '2023-01-01T00:00:00.000Z' })
    @IsDate()
    startDate: Date;

    @ApiProperty({ description: 'End date of the report period', example: '2023-01-31T23:59:59.999Z' })
    @IsDate()
    endDate: Date;
}