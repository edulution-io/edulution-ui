import { Controller, Get } from '@nestjs/common';
import { GetUsername } from '../common/decorators/getUser.decorator';
import NotificationService from "./notification.service.ts";

@Controller('notifications')
class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  async update(@GetUsername() username: string) {
    // this.notificationService.getCurrentConferences(username);

    this.notificationService.getOpenSurveys(username);

    this.notificationService.getMails(username);
  }
}

export default NotificationController;
