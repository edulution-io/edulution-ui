import { t } from 'i18next';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH.tsx';
import React from 'react';
import AIChatSetup from '@/pages/UserSettings/Components/ExternalIntegration/sections/AIChatSetup.tsx';
import MailSetup from '@/pages/UserSettings/Components/ExternalIntegration/sections/MailSetup.tsx';
import ChatSetup from '@/pages/UserSettings/Components/ExternalIntegration/sections/ChatSetup.tsx';

const ExternalIntegrationComponent = () => {
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
    <div>
      <h1 className="mb-1 pt-4 text-lg">{t('externIntegrationsetup.title')}</h1>
      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <AccordionSH type="multiple">
          {faqItems.map(({ value, title, Component }) => (
            <AccordionItem
              key={value}
              value={value}
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
