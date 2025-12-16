import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateWalletDto {
   @ApiProperty({
      description: 'Enter a valid currency',
      example: 'USD',
    })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';
}
