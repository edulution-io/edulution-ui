// This DTO is based on a third-party object definition from mailcow https://mailcow.docs.apiary.io/#reference/sync-jobs/create-sync-job/create-sync-job.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import CreateSyncJobDto from './mailcow-create-sync-job.dto';

type CreateSyncJobResponseDto = {
  type: string;
  log: [string, string, string, CreateSyncJobDto, null];
  msg: [string, string];
};

export default CreateSyncJobResponseDto;
