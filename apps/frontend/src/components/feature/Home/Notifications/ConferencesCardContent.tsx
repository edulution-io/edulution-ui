import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConferencesIcon } from '@/assets/icons';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { CardContent } from '@/components/shared/Card';
import Conference from '@/pages/ConferencePage/dto/conference.dto';

interface ConferencesCardContentProps {
  conferences: Conference[];
}

const ConferencesCardContent = (props: ConferencesCardContentProps) => {
  const { conferences } = props;
  const { t } = useTranslation();

  return (
    <CardContent>
      <h4
        color="white"
        className="font-bold"
      >
        <p>{t('conference.sidebar')}</p>
        <img
          src={ConferencesIcon}
          alt="conference"
          width={BUTTONS_ICON_WIDTH}
        />
      </h4>
      <div className="mt-4 flex flex-col justify-between gap-6">
        {conferences.map((conference) => (
          <>{JSON.stringify(conference, null, 2)}</>
        ))}
      </div>
    </CardContent>
  );
};

export default ConferencesCardContent;
