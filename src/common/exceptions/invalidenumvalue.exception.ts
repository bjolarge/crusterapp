import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidEnumValueException extends HttpException {
  constructor() {
    super('Invalid value for enum', HttpStatus.BAD_REQUEST);
  }
}
