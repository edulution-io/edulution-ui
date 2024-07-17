import { Injectable } from '@nestjs/common';

@Injectable()
export class FileSharingConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    this.envConfig = {
      EDUI_WEBDAV_URL: process.env.EDUI_WEBDAV_URL as string,
      EDUI_ENCRYPTION_KEY: process.env.EDUI_ENCRYPTION_KEY as string,
      EDUI_DOWNLOAD_DEV_DIR: process.env.EDUI_DOWNLOAD_DEV_DIR as string,
    };
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  set(key: string, value: string): void {
    this.envConfig[key] = value;
  }
}

export default FileSharingConfigService;
