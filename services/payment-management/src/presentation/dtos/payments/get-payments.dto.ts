
// View all payments linked to events (ticket purchases, refunds, payouts)

import { ApiProperty } from "@nestjs/swagger";

export class GetPaymentsDto {

    @ApiProperty({description: "Event ID", example: "849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3", required: false})

    eventId?: string;

    @ApiProperty({description: "User ID", example: "849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3", required: false})
    userId?: string;

    @ApiProperty({description: "Payment Status", example: "success", required: false, enum: ['success', 'Pending', 'Refund In Progress']})

    status?: PaymentStatus;

}

// make enum for status
export enum PaymentStatus {
    SUCCESS = 'success',
    PENDING = 'Pending',
    REFUND_IN_PROGRESS = 'Refund In Progress',
}