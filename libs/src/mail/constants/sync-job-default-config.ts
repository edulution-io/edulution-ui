import { CreateSyncJobDto } from '../types';
import MailEncryption from './mailEncryption';

const syncjobDefaultConfig: CreateSyncJobDto = {
  username: '',
  host1: '',
  port1: '',
  user1: '',
  password1: '',
  enc1: MailEncryption.SSL,
  subfolder2: '',
  delete2duplicates: 1,
  delete1: 0,
  delete2: 0,
  automap: 1,
  skipcrossduplicates: 0,
  active: 1,
  subscribeall: 1,
  mins_interval: 15,
  maxage: 0,
  maxbytespersecond: 0,
  timeout1: 600,
  timeout2: 600,
  exclude: '(?i)spam|(?i)junk',
};

export default syncjobDefaultConfig;
