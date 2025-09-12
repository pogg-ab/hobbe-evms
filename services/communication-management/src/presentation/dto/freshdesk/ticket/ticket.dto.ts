// src/presentation/dtos/ticket.dto.ts
import { IsString, IsEmail, IsNumber, IsOptional, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
    @ApiProperty({ description: 'Subject of the ticket', example: 'Website not loading' })
    @IsString()
    subject: string;

    @ApiProperty({ description: 'Detailed description of the issue', example: 'The website returns 500 error when accessing the homepage' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Email of the requester', example: 'customer@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Priority level (1-4)', example: 2, enum: [1, 2, 3, 4] })
    @IsNumber()
    priority: number;

    @ApiProperty({ description: 'Status of the ticket', example: 2, enum: [2, 3, 4, 5, 6] })
    @IsNumber()
    status: number;
}

export class UpdateTicketDto {
    @ApiPropertyOptional({ description: 'Subject of the ticket', example: 'Website not loading - URGENT' })
    @IsOptional()
    @IsString()
    subject?: string;

    @ApiPropertyOptional({ description: 'Detailed description of the issue', example: 'The website returns 500 error when accessing any page' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Email of the requester', example: 'customer.updated@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Priority level (1-4)', example: 1, enum: [1, 2, 3, 4] })
    @IsOptional()
    @IsNumber()
    priority?: number;

    @ApiPropertyOptional({ description: 'Status of the ticket', example: 3, enum: [2, 3, 4, 5, 6] })
    @IsOptional()
    @IsNumber()
    status?: number;
}

export class TicketResponseDto {


    @ApiProperty({ description: 'Subject of the ticket', example: 'Website not loading' })
    @IsString()
    subject: string;

    @ApiProperty({ description: 'Detailed description of the issue', example: 'The website returns 500 error when accessing the homepage' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Email of the requester', example: 'customer@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Priority level (1-4)', example: 2, enum: [1, 2, 3, 4] })
    @IsNumber()
    priority: number;

    @ApiProperty({ description: 'Status of the ticket', example: 2, enum: [2, 3, 4, 5, 6] })
    @IsNumber()
    status: number;


}