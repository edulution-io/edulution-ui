import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import type VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';

type ExtendedOptionKeysDto = {
  [key in ExtendedOptionKeysType]?: string;
} & {
  VEYON_PROXYS?: VeyonProxyItem[];
};

export default ExtendedOptionKeysDto;
