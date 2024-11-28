import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

type ExtendedOptionKeysDto = {
  [key in ExtendedOptionKeys]?: string;
};

export default ExtendedOptionKeysDto;
