import { Controller, Get } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import MailsService from './mails.service';
import GetCurrentUser from '../common/decorators/getUser.decorator';

@Controller('mails')
class MailsController {
  // constructor(private readonly mailsService: MailsService) {}

  @Get()
  static update(@GetCurrentUser() user: JwtUser) {
    return MailsService.mailRoutine(user);
  }
}

export default MailsController;
