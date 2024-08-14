// This DTO is based on a third-party object definition from mailcow https://mailcow.docs.apiary.io/#reference/sync-jobs/create-sync-job/create-sync-job.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

type SyncJobResponseDto = {
  type: string;
  log: string[];
  msg: string[];
};

export default SyncJobResponseDto;
