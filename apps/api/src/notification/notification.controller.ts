import { Controller, Get } from '@nestjs/common';
import { GetUsername } from '../common/decorators/getUser.decorator';
import NotificationService from './notification.service';

@Controller('notifications')
class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async update(@GetUsername() username: string) {
    // const conferences = await this.notificationService.getCurrentConferences(username);

    const openSurveys = await this.notificationService.getOpenSurveys(username);

    const mails = await this.notificationService.getMails(username);

    return { /* conferences, */ openSurveys, mails };
  }
}

export default NotificationController;
