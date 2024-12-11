import { join } from 'path';
import APPS from '@libs/appconfig/constants/apps';

export const APPS_FOLDER_PATH = join(__dirname, '..', '..');
export const BULLETIN_ATTACHMENTS_PATH = join(APPS_FOLDER_PATH, APPS.BULLETIN_BOARD, 'attachments');
