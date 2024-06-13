import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConferencesIcon } from '@/assets/icons';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import ConferencesList from '@/components/feature/Home/CurrentAffairs/components/ConferencesList';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';

interface ConferencesCardContentProps {
  conferences: Conference[];
}

const ConferencesCardContent = (props: ConferencesCardContentProps) => {
  const { conferences } = props;
  const { t } = useTranslation();

  return (
    <Collapsible
      defaultOpen={true}
    >
      <CollapsibleTrigger className="text-xl font-bold flex">
        <img
          src={ConferencesIcon}
          alt="conference-notification"
          width={BUTTONS_ICON_WIDTH}
          className="mr-4"
        />
        {t('conferences.sidebar')}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ConferencesList items={conferences} className="mt-2 mb-6" />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ConferencesCardContent;
