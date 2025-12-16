import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class TransferWalletDto {
  // @IsUUID()
   @ApiProperty({
      description: 'Receiver wallet UUID',
      example: 'fjdlcjdlvjkdl*****',
    })
  @IsString()
  receiverWalletId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
