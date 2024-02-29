import React from 'react';
import { useTranslation } from 'react-i18next';

const ConferencePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="mb-1 text-lg">{t('conferencePage')}</h1>
      <p className="text-lg">
        Welcome to our website! We are a team of passionate individuals dedicated to providing high-quality software
        solutions.
      </p>
      <p className="text-md mt-4">
        Our mission is to empower businesses and individuals with innovative technology that enhances productivity and
        simplifies processes.
      </p>
    </div>
  );
};

export default ConferencePage;
