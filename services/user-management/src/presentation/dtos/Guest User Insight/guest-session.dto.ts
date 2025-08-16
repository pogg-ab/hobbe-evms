import { ApiProperty } from '@nestjs/swagger';
import { SessionID } from 'src/domain/value-objects/session-id.value-object';

export class GuestSessionDto {
    @ApiProperty({
        description: 'Guest session ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    sessionId: SessionID;

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

    @ApiProperty({
        description: 'Session creation timestamp',
        example: '2023-12-31T23:59:59.999Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last activity timestamp',
        example: '2023-12-31T23:59:59.999Z',
    })
    lastActivity: Date;

    @ApiProperty({
        description: 'Indicates if the session is currently active',
        example: true,
    })
    isActive: boolean;
}