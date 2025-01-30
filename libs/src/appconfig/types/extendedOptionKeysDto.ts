import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import TAppFieldType from '@libs/appconfig/types/tAppFieldType';
import type VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';

type ExtendedOptionKeysDto = {
  [key in ExtendedOptionKeysType]?: TAppFieldType;
} & {
  VEYON_PROXYS?: VeyonProxyItem[];
};

export default ExtendedOptionKeysDto;
