import { Controller, Get, Post, Res, Body, Logger, HttpStatus } from '@nestjs/common';
import AppService from './app.service';

enum AppType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

type ConfigType = {
  [key: string]: { linkPath: string; icon: string; appType: AppType };
};

@Controller()
class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('config')
  async storeConfig(@Res() res: any, @Body() body: ConfigType) {
    try {
      Logger.log(body);

      res.status(HttpStatus.CREATED).send({ config: body });
    } catch (error) {
      Logger.log('Error storing config:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Failed to store config' });
    }
  }
}

export default AppController;
