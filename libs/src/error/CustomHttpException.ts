import { HttpException, HttpStatus } from '@nestjs/common';
import ErrorMessage from '@libs/error/errorMessage';

export class CustomHttpException extends HttpException {
  constructor(errorMessage: ErrorMessage, status: HttpStatus, data?: any) {
    super(errorMessage, status);
    this.logError(errorMessage, status, data);
  }

  private logError(message: ErrorMessage, status: HttpStatus, data?: any) {
    // Uses process.stderr instead of console.error because it omits an additional line break at the end of the line
    process.stderr.write(`Status: ${status}, Message: ${message}, Data: ${JSON.stringify(data)}`);
  }
}
