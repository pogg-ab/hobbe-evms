import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsPhoneNumber,
    IsDateString,
    IsStrongPassword,
} from 'class-validator';
import { IsEqualTo } from '../decorators/is-equal-to.decorator';

export class UpdateUserDto {
    @ApiProperty({ description: 'The username of the user', example: 'john.doe' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'The first name of the user', example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ description: 'The last name of the user', example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'The phone number of the user',
        example: '+123456789',
    })
    @IsPhoneNumber()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ description: 'The country of the user', example: 'USA' })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({
        description: 'The date of birth of the user (YYYY-MM-DD)',
        example: '1990-01-01',
    })
    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @ApiProperty({ description: 'The gender of the user', example: 'Male' })
    @IsString()
    @IsOptional()
    gender?: string;

    @ApiProperty({
        description: 'The profile image of the user',
        example: 'data:image/png;base64,...',
    })
    @IsOptional()
    @IsString()
    profileImage?: string;

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
}
