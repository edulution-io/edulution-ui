import { Injectable } from '@nestjs/common';

@Injectable()
class AppService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}

export default AppService;
