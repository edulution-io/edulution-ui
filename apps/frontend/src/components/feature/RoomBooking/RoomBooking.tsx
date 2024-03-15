import React from 'react';
import { useTranslation } from 'react-i18next';

const RoomBooking: React.FC = () => {
  const { t } = useTranslation();

  return <h4>{t('roomBooking.title')}</h4>;
};

export default RoomBooking;
