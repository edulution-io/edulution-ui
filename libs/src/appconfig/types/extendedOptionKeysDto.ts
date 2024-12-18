import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';

type ExtendedOptionKeysDto = {
  [key in ExtendedOptionKeysType]?: string;
};

export default ExtendedOptionKeysDto;
