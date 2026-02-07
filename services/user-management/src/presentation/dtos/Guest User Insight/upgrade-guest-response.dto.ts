import { ApiProperty } from '@nestjs/swagger';

export class UpgradeGuestResponseDto {
    @ApiProperty({
        description: 'Indicates if the upgrade was successful',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'User ID that was upgraded',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    userId: string;

    @ApiProperty({
        description: 'Guest session ID that was upgraded',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    sessionId: string;

    @ApiProperty({
        description: 'Timestamp when the upgrade occurred',
        example: '2023-12-31T23:59:59.999Z',
    })
    upgradedAt: Date;
}