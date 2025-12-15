import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

export class StateInvalidException extends HttpException {
  // constructor() {
  //   super('Our service is not yet available in the selected state. Try any of these:[Oyo, Fct, Lagos, Rivers]', HttpStatus.BAD_REQUEST);
  // }

  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}