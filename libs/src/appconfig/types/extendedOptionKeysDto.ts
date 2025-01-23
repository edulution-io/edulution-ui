import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import TAppFieldType from '@libs/appconfig/types/tAppFieldType';

type ExtendedOptionKeysDto = {
  [key in ExtendedOptionKeysType]?: TAppFieldType;
};

export default ExtendedOptionKeysDto;
