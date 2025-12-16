import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'crusterproject@project.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Ojo Ajadi',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Password for the account',
    example: 'Stron$Pass123!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Phone number of the user -include country code',
    example: '+2348021853479',
    required: false,
  })
  @IsPhoneNumber()
  @IsOptional()
  public phoneNumber?: string;

  @ApiProperty({
    description: 'Address of the user',
    example: '14B Lekki Penisula, Lekki, Lagos',
    required: false,
  })
  @IsString()
  @IsOptional()
  public address?: string;
}
