import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class PasswordResetDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}