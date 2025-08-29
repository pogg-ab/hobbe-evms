import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsNumber, Min, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterEventsDto {
    @ApiProperty({
        description: 'Event count type filter',
        example: 'all',
        enum: ['all', 'Total events', 'Active events', 'Pending events'],
        required: false,
        default: 'all',
    })
    @IsOptional()
    @IsIn(['all', 'Total events', 'Active events', 'Pending events'])
    countType?: 'all' | 'Total events' | 'Active events' | 'Pending events' = 'all';

    @ApiProperty({
        description: 'Status filter for events',
        example: 'all',
        enum: ['all', 'Upcoming', 'Ongoing', 'Past', 'Pending Approval'],
        required: false,
        default: 'all',
    })
    @IsOptional()
    @IsIn(['all', 'Upcoming', 'Ongoing', 'Past', 'Pending Approval'])
    status?: 'all' | 'Upcoming' | 'Ongoing' | 'Past' | 'Pending Approval' = 'all';

    @ApiProperty({
        description: 'Event status (drafted, pending, cancelled, rejected, postponed, active)',
        example: 'all',
        enum: ['all', 'drafted', 'pending', 'cancelled', 'rejected', 'postponed', 'active'],
        required: false,
        default: 'all',
    })
    @IsOptional()
    @IsIn(['all', 'drafted', 'pending', 'cancelled', 'rejected', 'postponed', 'active'])
    eventStatus?: 'all' | 'drafted' | 'pending' | 'cancelled' | 'rejected' | 'postponed' | 'active' = 'all';

    @ApiProperty({
        description: 'Event type filter',
        example: 'all',
        enum: ['all', 'Conference', 'Workshop', 'Seminar', 'Webinar', 'Networking', 'Other'],
        required: false,
        default: 'all',
    })
    @IsOptional()
    @IsIn(['all', 'Conference', 'Workshop', 'Seminar', 'Webinar', 'Networking', 'Other'])
    eventType?: string = 'all';

    @ApiProperty({
        description: 'Organizer ID ',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsString()
    organizer?: string;

    @ApiProperty({
        description: 'Start date range (YYYY-MM-DD)',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date range (YYYY-MM-DD)',
        example: '2024-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Search by event name',
        example: 'Tech Conference',
        required: false,
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        required: false,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        required: false,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiProperty({
        description: 'Sort by field',
        example: 'startDate',
        enum: ['createdAt', 'startDate', 'title', 'eventType', 'organizer'],
        required: false,
        default: 'startDate',
    })
    @IsOptional()
    @IsIn(['createdAt', 'startDate', 'title', 'eventType', 'organizer'])
    sortBy?: string = 'startDate';

    @ApiProperty({
        description: 'Sort order',
        example: 'asc',
        enum: ['asc', 'desc'],
        required: false,
        default: 'asc',
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'asc';
}