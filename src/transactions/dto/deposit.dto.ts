import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
    @ApiProperty({
    description: 'Amount to deposit (must be greater than 0)',
    example: 500,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1, { message: 'Deposit amount must be greater than 0' })
  amount: number;
}
