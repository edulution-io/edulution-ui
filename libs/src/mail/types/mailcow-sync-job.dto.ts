// This DTO is based on a third-party object definition from mailcow https://mailcow.docs.apiary.io/#reference/sync-jobs/create-sync-job/create-sync-job.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import TMailEncryption from './mailEncryption.type';

type SyncJobDto = {
  id: number;
  user1: string;
  host1: string;
  authmech1: string;
  user2: string;
  exclude: string;
  maxage: number;
  mins_interval: number;
  maxbytespersecond: number;
  port1: number;
  enc1: TMailEncryption;
  delete2duplicates: number;
  delete1: number;
  delete2: number;
  automap: number;
  skipcrossduplicates: number;
  timeout1: number;
  timeout2: number;
  subscribeall: number;
  dry: number;
  is_running: number;
  last_run: string;
  success: number;
  exit_status: string;
  created: string;
  modified: string;
  active: number;
  log: string;
};

export default SyncJobDto;
