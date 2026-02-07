import { ApiProperty } from '@nestjs/swagger';

export class CreateGuestSessionResponseDto {
    @ApiProperty({
        description: 'Guest session ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    sessionId: string;

    @ApiProperty({
        description: 'Authentication token for the guest session',
        example: 'a1b2c3d4e5f6...',
    })
    authToken: string;

    @ApiProperty({
        description: 'Refresh token for the guest session',
        example: 'z9y8x7w6v5u...',
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Session token for guest tracking',
        example: 'x1y2z3a4b5c6...',
    })
    sessionToken: string;

    @ApiProperty({
        description: 'Token expiration timestamp',
        example: '2023-12-31T23:59:59.999Z',
    })
    expiresAt: Date;
}