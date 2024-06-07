import { t } from 'i18next';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH.tsx';
import React from 'react';
import AIChatSetup from '@/pages/UserSettings/Components/ExternalIntegration/sections/AIChatSetup.tsx';
import MailSetup from '@/pages/UserSettings/Components/ExternalIntegration/sections/MailSetup.tsx';
import ChatSetup from '@/pages/UserSettings/Components/ExternalIntegration/sections/ChatSetup.tsx';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { ExternalIntegration } from '@/assets/icons';
import cn from '@/lib/utils';
import { useMediaQuery } from 'usehooks-ts';

const ExternalIntegrationComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const faqItems = [
    {
      value: 'filemangerIntroduction',
      title: t('externIntegrationsetup.AIChatSetUp'),
      Component: AIChatSetup,
    },
    {
      value: 'classManagementIntroduction',
      title: t('externIntegrationsetup.MailSetUp'),
      Component: MailSetup,
    },
    {
      value: 'conferenceIntroduction',
      title: t('externIntegrationsetup.ChatSetUp'),
      Component: ChatSetup,
    },
  ];

  return (
    <div className={cn('absolute bottom-[32px] right-[57px] top-3 h-screen', isMobile ? 'left-4' : 'left-[256px]')}>
      <NativeAppHeader
        title={t('externIntegrationsetup.title')}
        description={t('externIntegrationsetup.description')}
        iconSrc={ExternalIntegration}
      />
      <div className="p-4">
        <AccordionSH type="multiple">
          {faqItems.map(({ value, title, Component }) => (
            <AccordionItem
              key={value}
              value={value}
              className={'mt-6'}
            >
              <AccordionTrigger className="w-full text-xl font-bold">{title}</AccordionTrigger>
              <AccordionContent>
                <Component />
              </AccordionContent>
            </AccordionItem>
          ))}
        </AccordionSH>
      </div>
    </div>
  );
};

export default ExternalIntegrationComponent;
