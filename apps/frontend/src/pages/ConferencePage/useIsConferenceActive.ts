import { useMemo } from 'react';
import { AppConfigDto, APPS } from '@libs/appconfig/types';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';

// TODO: NIEDUUI-312: Remove this check when the information about the app is stored in the appConfigs/userConfig/dataBase
const useIsConferenceActive = () => {
  const { appConfigs } = useAppConfigsStore();

  return useMemo(
    () => !!appConfigs.find((conf: AppConfigDto) => conf.name === APPS.CONFERENCES.toString()),
    [appConfigs],
  );
};

export default useIsConferenceActive;
