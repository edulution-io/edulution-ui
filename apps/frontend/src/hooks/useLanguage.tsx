import { useMemo } from 'react';
import useUserStore from '@/store/UserStore/UserStore';

const useLanguage = () => {
  const { language: userLanguage } = useUserStore().user || {};
  const language = useMemo(() => {
    if (userLanguage && userLanguage !== 'system') {
      return userLanguage;
    }
    const currentLanguage = navigator?.language || 'de-DE';
    return currentLanguage.split('-')[0];
  }, [userLanguage]);

  return { language };
};

export default useLanguage;
