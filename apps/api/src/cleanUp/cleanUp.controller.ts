import { Controller, Delete, Query } from '@nestjs/common';
import CleanUpApiEndpoints from '@libs/cleanUp/types/CleanUpApiEndpoints';
import CleanUpService from './cleanUp.service';

@Controller(CleanUpApiEndpoints.BASE)
class CleanUpController {
  constructor(private readonly cleanUpService: CleanUpService) {}

  @Delete()
  async cleanUpDownloads(@Query('fileName') fileName: string) {
    return this.cleanUpService.cleanUpDownloads(fileName);
  }
}

export default CleanUpController;
