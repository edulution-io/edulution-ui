import { SyncJobDto } from '@libs/mail/types';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
class FilterUserPipe implements PipeTransform {
  constructor(private readonly username: string) {}

  transform(syncJobs: SyncJobDto[], _metadata: ArgumentMetadata) {
    if (!Array.isArray(syncJobs)) {
      throw new BadRequestException('Expected an array');
    }

    return syncJobs.filter((item) => item.user2.includes(this.username));
  }
}

export default FilterUserPipe;
