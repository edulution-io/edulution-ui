import React from 'react';
import { useTranslation } from 'react-i18next';

const RoomBooking: React.FC = () => {
  const { t } = useTranslation();

  return <h4>{t('roombooking.title')}</h4>;
};

export default RoomBooking;
