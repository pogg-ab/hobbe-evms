import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveEventDto {
  @ApiProperty({
    description: 'Optional feedback for the approval',
    example: 'Event approved successfully.',
    required: false,
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class SetEventPendingDto {
  @ApiProperty({
    description: 'Optional feedback for setting the event to pending status',
    example: 'Event sent for approval.',
    required: false,
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class RejectEventDto {
  @ApiProperty({
    description: 'Reason for rejecting the event',
    example: 'Event does not meet content guidelines.',
  })
  @IsString()
  feedback: string;
}

export class RequestEventChangesDto {
  @ApiProperty({
    description: 'Feedback detailing the changes required',
    example:
      'Please update the event description to include more details about the agenda.',
  })
  @IsString()
  feedback: string;
}
