import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({
    description: 'ID of the user who will receive the money from the user entity',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  receiverId: number;

    @ApiProperty({
    description: 'Amount to transfer (must be positive)',
    example: 150,
  })
  @IsPositive()
  amount: number;
}

