import { ApiProperty } from '@nestjs/swagger';
import { Session } from 'inspector/promises';
import { SessionID } from 'src/domain/value-objects/session-id.value-object';

export class DeviceStatsDto {
    @ApiProperty({
        description: 'Number of mobile devices',
        example: 42,
    })
    mobile: number;

    @ApiProperty({
        description: 'Number of desktop devices',
        example: 35,
    })
    desktop: number;

    @ApiProperty({
        description: 'Number of tablet devices',
        example: 15,
    })
    tablet: number;

    @ApiProperty({
        description: 'Number of other/unknown devices',
        example: 8,
    })
    other: number;
}

export class RecentSessionDto {
    @ApiProperty({
        description: 'Session ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    sessionId: SessionID;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2023-12-31T23:59:59.999Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last activity timestamp',
        example: '2023-12-31T23:59:59.999Z',
    })
    lastActivity: Date;

    @ApiProperty({
        description: 'Device information',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    })
    deviceInfo: string;

    @ApiProperty({
        description: 'IP address',
        example: '192.168.1.1',
    })
    ipAddress: string;
}

export class GuestInsightsDto {
    @ApiProperty({
        description: 'Total number of guest sessions',
        example: 100,
    })
    totalSessions: number;

    @ApiProperty({
        description: 'Number of currently active sessions',
        example: 15,
    })
    activeSessions: number;

    @ApiProperty({
        description: 'Number of sessions converted to registered users',
        example: 25,
    })
    convertedSessions: number;

    @ApiProperty({
        description: 'Conversion rate percentage',
        example: 25.0,
    })
    conversionRate: number;

    @ApiProperty({
        description: 'Average session duration in milliseconds',
        example: 1800000,
    })
    averageSessionDuration: number;

    @ApiProperty({ type: DeviceStatsDto })
    deviceStats: DeviceStatsDto;

    @ApiProperty({ type: [RecentSessionDto] })
    recentSessions: RecentSessionDto[];
}