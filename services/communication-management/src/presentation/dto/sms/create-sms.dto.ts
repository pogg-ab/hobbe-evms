import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  MMS = 'MMS',
  OTP = 'OTP',
}

export class CreateSmsDto {
  @IsNotEmpty()
  @IsPhoneNumber(null)
  recipient: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsEnum(MessageType)
  messageType: MessageType;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number | null;
}
