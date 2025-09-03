import { ApiProperty } from '@nestjs/swagger';

export class UpgradeGuestDto {
    @ApiProperty({
        description: 'Guest session ID to upgrade',
        required: true,
    })
    sessionId: string;

    @ApiProperty({
        description: 'User ID to associate with the guest session',
        required: true,
    })
    userId: string;
}