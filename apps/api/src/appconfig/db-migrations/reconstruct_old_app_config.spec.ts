import { AppConfigDto } from '@libs/appconfig/types';
import OLD_APP_CONFIG from './oldAppConfig.mock';
import NEW_APP_CONFIG from './newAppConfig.mock';
import reconstructOldAppConfig from './reconstruct_old_app_config';

describe('migration-reconstruct-options-and-extended-options', () => {
  describe('migrationUpdateAppConfig', () => {
    it('should reconstruct options and extended options', () => {
      const updatedAppConfig: AppConfigDto = reconstructOldAppConfig(OLD_APP_CONFIG);
      expect(updatedAppConfig).toEqual(NEW_APP_CONFIG);
    });
  });
});
