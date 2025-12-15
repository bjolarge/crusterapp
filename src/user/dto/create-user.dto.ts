import {IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword} from 'class-validator';
export class CreateUserDto {
    @IsString()
    @IsEmail()
    email: string;
    @IsString()
    name: string;
    @IsString()
    @IsStrongPassword()
    password: string;

   @IsPhoneNumber()
   @IsNotEmpty()
    public phoneNumber:string;
  
    @IsString()
   @IsNotEmpty()
    public address:string;
  
}