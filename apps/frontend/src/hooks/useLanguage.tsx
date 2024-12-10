import { useState, useEffect } from 'react';
import useUserStore from '@/store/UserStore/UserStore';

const INITIAL_LANGUAGE = 'de';

const useLanguage = () => {
  const [language, setLanguage] = useState(INITIAL_LANGUAGE);

  const { user } = useUserStore();

  useEffect(() => {
    if (user?.language && user?.language !== 'system') {
      setLanguage(user?.language);
      return;
    }
    const currentLanguage = navigator?.language || 'de-DE';
    const locale = currentLanguage.split('-')[0];
    setLanguage(locale || INITIAL_LANGUAGE);
  }, [user]);

  return { language };
};

export default useLanguage;
