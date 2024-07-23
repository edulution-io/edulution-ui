import { Controller, Get } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import MailsService from './mails.service';
import GetCurrentUser from '../common/decorators/getUser.decorator';

@Controller('mails')
class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Get()
  update(@GetCurrentUser() user: JwtUser) {
    return this.mailsService.mailRoutine(user);
  }
}

export default MailsController;
