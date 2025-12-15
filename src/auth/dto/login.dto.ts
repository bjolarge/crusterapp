import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
export class LoginDto{
     @ApiProperty({
    description: 'Email address of the user',
    example: 'koinsave@project.com',
    required: true,
  })
    @IsEmail()
    email: string;
  
     @ApiProperty({
        description: 'Password for the account user',
        example: 'Stron$Pass123!',
        required: true,
      })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string; 
}