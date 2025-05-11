import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsStrongPassword,
    IsEnum,
    ValidateIf,
} from 'class-validator';
import { IsEqualTo } from '../decorators/is-equal-to.decorator';
import { UpdatePersonalAccountDto } from './update-personal-account.dto';
import { UpdateOrganizationalAccountDto } from './update-organizational-account.dto';

export enum AccountType {
    PERSONAL = 'personal',
    ORGANIZATIONAL = 'organizational',
}

export class UpdateUserDto {
    @ApiProperty({ description: 'The account type (personal or organizational)', example: 'personal' })
    @IsEnum(AccountType)
    @IsNotEmpty()
    accountType: AccountType;

    @ApiProperty({ description: 'The username of the user', example: 'john.doe' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'Enter new password if updating it',
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsStrongPassword()
    password?: string;

    @ApiProperty({
        description: 'Confirm new password if updating it',
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsStrongPassword()
    @IsEqualTo('password', {
        message: 'Confirm password does not match password',
    })
    confirmPassword?: string;

    @ApiProperty({
        description: 'Personal Account Data',
        type: UpdatePersonalAccountDto,
        required: false,
    })
    @IsOptional()
    @ValidateIf((o) => o.accountType === AccountType.PERSONAL)
    personalAccount?: UpdatePersonalAccountDto;

    @ApiProperty({
        description: 'Organizational Account Data',
        type: UpdateOrganizationalAccountDto,
        required: false,
    })
    @IsOptional()
    @ValidateIf((o) => o.accountType === AccountType.ORGANIZATIONAL)
    organizationalAccount?: UpdateOrganizationalAccountDto;
}
