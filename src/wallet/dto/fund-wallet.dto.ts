import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class FundWalletDto {
   @ApiProperty({
      description: 'Fundwallet with an amount',
      example: 200,
    })
  @IsNumber()
  @IsPositive()
  amount: number;
}
