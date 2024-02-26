import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('Welcome to the Home component!')}</h1>
      {/* Add your content here */}
    </div>
  );
};

export default About;
