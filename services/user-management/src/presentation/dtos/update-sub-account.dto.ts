import { PartialType } from '@nestjs/swagger';
import { CreateSubAccountDto } from './create-sub-account.dto';

export class UpdateSubAccountDto extends PartialType(CreateSubAccountDto) {}
