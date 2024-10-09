import { useMemo } from 'react';
import { AppConfigDto } from '@libs/appconfig/types';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APPS from '@libs/appconfig/constants/apps';

// TODO: NIEDUUI-312: Remove this check when the information about the app is stored in the appConfigs/userConfig/dataBase
const useIsMailsActive = () => {
  const { appConfigs } = useAppConfigsStore();

  return useMemo(() => !!appConfigs.find((conf: AppConfigDto) => conf.name === APPS.MAIL.toString()), [appConfigs]);
};

export default useIsMailsActive;
