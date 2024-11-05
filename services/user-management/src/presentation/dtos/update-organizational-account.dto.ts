import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationalAccountDto } from './create-organizational-account.dto';

export class UpdateOrganizationalAccountDto extends PartialType(CreateOrganizationalAccountDto) {}
