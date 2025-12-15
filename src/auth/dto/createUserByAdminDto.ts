import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, MinLength } from 'class-validator';
import Role from '../../user/enum/role.enum';

export class CreateUserByAdminDto {
   @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsPhoneNumber()
   @IsNotEmpty()
    public phoneNumber:string;

    @IsString()
    @IsNotEmpty()
    public address:string;
  
    @IsString()
    @IsNotEmpty()
    public NinOrPassportNo:string;

@IsEnum(Role, { each: true })
@IsOptional()
roles?: Role[];
}
