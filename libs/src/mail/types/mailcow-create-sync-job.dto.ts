// This DTO is based on a third-party object definition from mailcow https://mailcow.docs.apiary.io/#reference/sync-jobs/create-sync-job/create-sync-job.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import TMailEncryption from './mailEncryption.type';

type CreateSyncJobDto = {
  username: string;
  delete2duplicates: boolean;
  delete1: boolean;
  delete2: boolean;
  automap: boolean;
  skipcrossduplicates: boolean;
  active: boolean;
  subscribeall: boolean;
  host1: string;
  port1: string;
  user1: string;
  password1: string;
  enc1: TMailEncryption;
  mins_interval: number;
  subfolder2: string;
  maxage: number;
  maxbytespersecond: number;
  timeout1: number;
  timeout2: number;
  exclude: string;
};

export default CreateSyncJobDto;
