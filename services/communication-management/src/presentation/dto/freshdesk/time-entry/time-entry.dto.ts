import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeEntryDto {
    @ApiProperty({ description: 'ID of the agent logging time', example: 5678 })
    @IsNumber()
    agentId: number;

    @ApiProperty({ description: 'Note about the time entry', example: 'Investigated server logs and identified the issue' })
    @IsString()
    note: string;

    @ApiProperty({ description: 'Time spent in format "HH:MM"', example: '02:30' })
    @IsString()
    timeSpent: string;

    @ApiPropertyOptional({ description: 'Date and time when the work was executed', example: '2023-01-15T10:30:00.000Z' })
    @IsOptional()
    @IsDateString()
    executedAt?: Date;
}

export class TimeEntryResponseDto {
    @ApiProperty({ description: 'Unique identifier of the time entry', example: 445566 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'Ticket ID this time entry belongs to', example: 12345 })
    @IsNumber()
    ticketId: number;

    @ApiProperty({ description: 'ID of the agent who logged time', example: 5678 })
    @IsNumber()
    agentId: number;

    @ApiProperty({ description: 'Note about the time entry', example: 'Investigated server logs and identified the issue' })
    @IsString()
    note: string;

    @ApiProperty({ description: 'Time spent in format "HH:MM"', example: '02:30' })
    @IsString()
    timeSpent: string;

    @ApiProperty({ description: 'Date and time when the work was executed', example: '2023-01-15T10:30:00.000Z' })
    executedAt: Date;

    @ApiProperty({ description: 'Creation timestamp', example: '2023-01-15T10:30:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp', example: '2023-01-15T14:45:00.000Z' })
    updatedAt: Date;
}