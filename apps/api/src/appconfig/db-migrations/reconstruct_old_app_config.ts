import { AppConfigDto } from '@libs/appconfig/types';
import TOldAppConfig from './tOldAppConfig';
import reconstructOptionsAndExtendedOptions from './reconstruct_options_and_extended_options';

function reconstructOldAppConfig(appConfigWithOldStructure: TOldAppConfig): AppConfigDto {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { extendedOptions, options, ...appConfig } = appConfigWithOldStructure;
  const updatedOptions = reconstructOptionsAndExtendedOptions(appConfigWithOldStructure);
  return {
    ...appConfig,
    options: updatedOptions,
  } as AppConfigDto;
}

export default reconstructOldAppConfig;
