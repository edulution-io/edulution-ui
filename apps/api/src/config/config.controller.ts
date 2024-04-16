import { Controller, Post, Body, Logger, HttpStatus, HttpException, Get } from '@nestjs/common';

enum AppType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

type ConfigType = {
  [key: string]: { linkPath: string; icon: string; appType: AppType };
};

@Controller('config')
class ConfigController {
  private configs: ConfigType[] = [];

  @Post()
  createConfig(@Body() config: ConfigType): string {
    if (!config) {
      throw new HttpException('Username and email are required fields!', HttpStatus.BAD_REQUEST);
    }
    this.configs.push(config);
    Logger.log(this.configs);
    return 'User created successfully!';
  }

  @Get()
  getConfig() {
    Logger.log('get data');
    return {
      conferences: {
        linkPath: 'https://tailwindcss.com',
        icon: '/src/assets/icons/edulution/Konferenzen.svg',
        appType: 'forwarded',
      },
      ticketsystem: {
        linkPath: '',
        icon: '/src/assets/icons/edulution/Ticketsystem.svg',
        appType: 'forwarded',
      },
      mail: {
        linkPath: 'https://tailwindcss.com',
        icon: '/src/assets/icons/edulution/Mail.svg',
        appType: 'embedded',
      },
      filesharing: {
        linkPath: '',
        icon: '',
        appType: 'native',
      },
    };
  }
}

export default ConfigController;
