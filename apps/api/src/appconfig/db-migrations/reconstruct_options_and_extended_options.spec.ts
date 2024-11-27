import { AppConfigSection } from '@libs/appconfig/types';
import OLD_APP_CONFIG from './oldAppConfig.mock';
import NEW_APP_CONFIG from './newAppConfig.mock';
import reconstructOptionsAndExtendedOptions from './reconstruct_options_and_extended_options';

describe('migration-reconstruct-options-and-extended-options', () => {
  describe('reconstructOptionsAndExtendedOptions', () => {
    it('should reconstruct options and extended options', () => {
      const updatedOptions: AppConfigSection[] = reconstructOptionsAndExtendedOptions(OLD_APP_CONFIG);
      expect(updatedOptions).toEqual(NEW_APP_CONFIG.options);
    });
  });
});
