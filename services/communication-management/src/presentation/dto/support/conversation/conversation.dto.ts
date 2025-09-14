import { IsString, IsEmail, IsBoolean, IsNumber, IsDate, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
    @ApiProperty({ description: 'Content of the conversation', example: 'We are looking into the issue and will update you shortly.' })
    @IsString()
    body: string;

    @ApiProperty({ description: 'Email of the sender', example: 'support@example.com' })
    @IsEmail()
    fromEmail: string;

    @ApiPropertyOptional({ description: 'User ID if the sender is a registered user', example: 5678 })
    @IsOptional()
    @IsNumber()
    userId?: number;

    @ApiPropertyOptional({ description: 'Set to true if the conversation is private', example: false })
    @IsOptional()
    @IsBoolean()
    isPrivate?: boolean;
}

export class UpdateConversationDto {
    @ApiPropertyOptional({ description: 'Content of the conversation', example: 'Updated response with more details' })
    @IsOptional()
    @IsString()
    body?: string;

    @ApiPropertyOptional({ description: 'Set to true if the conversation is private', example: true })
    @IsOptional()
    @IsBoolean()
    isPrivate?: boolean;
}

export class ConversationResponseDto {
    @ApiProperty({ description: 'Unique identifier of the conversation', example: 112233 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'Ticket ID this conversation belongs to', example: 12345 })
    @IsNumber()
    ticketId: number;

    @ApiProperty({ description: 'Content of the conversation', example: 'We are looking into the issue and will update you shortly.' })
    @IsString()
    body: string;

    @ApiProperty({ description: 'Email of the sender', example: 'support@example.com' })
    @IsEmail()
    fromEmail: string;

    @ApiPropertyOptional({ description: 'User ID if the sender is a registered user', example: 5678 })
    @IsOptional()
    @IsNumber()
    userId?: number;

    @ApiPropertyOptional({ description: 'Name of the user if available', example: 'John Smith' })
    @IsOptional()
    @IsString()
    userName?: string;

    @ApiProperty({ description: 'Whether the conversation is private', example: false })
    @IsBoolean()
    isPrivate: boolean;

    @ApiProperty({ description: 'Creation timestamp', example: '2023-01-15T10:30:00.000Z' })
    @IsDate()
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp', example: '2023-01-15T14:45:00.000Z' })
    @IsDate()
    updatedAt: Date;
}