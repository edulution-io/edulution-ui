import { Injectable, Logger } from '@nestjs/common';

enum AppType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

type ConfigType = {
  [key: string]: { linkPath: string; icon: string; appType: AppType };
};

@Injectable()
class ConfigService {
  private configs: ConfigType[] = [];

  createConfig(createConfig: ConfigType): ConfigType {
    this.configs.push(createConfig);
    Logger.log(this.configs);
    return createConfig;
  }

  getConfigs(): ConfigType[] {
    return this.configs;
  }
}

export default ConfigService;
