import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class SendSMSDto {
  @IsPhoneNumber(null, { message: 'Recipient must be a valid phone number' })
  @IsNotEmpty({ message: 'Recipient is required' })
  recipient: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @Length(1, 160, { message: 'Message should be between 1 and 160 characters' })
  message: string;

  @IsOptional()
  @IsString()
  @Length(1, 20, {
    message: 'Message type should be between 1 and 20 characters',
  })
  messageType?: string;

  @IsOptional()
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId?: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}
