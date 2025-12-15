import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    description: 'ID of the user who will receive the money -based on user id on the userentity',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

   @ApiProperty({
    description: 'Amount to transfer (must be at least 1)',
    example: 150,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1, { message: 'Transfer amount must be at least 1' })
  amount: number;
}
