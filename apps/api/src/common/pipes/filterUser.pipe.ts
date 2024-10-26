import { SyncJobDto } from '@libs/mail/types';
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
class FilterUserPipe implements PipeTransform {
  constructor(private readonly username: string) {}

  transform(syncJobs: SyncJobDto[], _metadata: ArgumentMetadata) {
    if (!Array.isArray(syncJobs)) {
      return [];
    }

    return syncJobs.filter((item) => item.user2.includes(this.username));
  }
}

export default FilterUserPipe;
