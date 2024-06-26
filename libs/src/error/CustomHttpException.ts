import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import ErrorMessage from '@libs/error/errorMessage';

class CustomHttpException extends HttpException {
  constructor(errorMessage: ErrorMessage, status: HttpStatus, data?: unknown) {
    super(errorMessage, status);
    CustomHttpException.logError(errorMessage, status, data);
  }

  private static logError(message: ErrorMessage, status: HttpStatus, data?: unknown) {
    const domain = message.slice(0, message.indexOf('.'));
    const error = message.slice(message.lastIndexOf('.') + 1, message.length);
    Logger.error(`HttpStatus: ${status}, Error: ${error}${data ? `, Data: ${JSON.stringify(data)}` : ''}`, domain);
  }
}

export default CustomHttpException;
