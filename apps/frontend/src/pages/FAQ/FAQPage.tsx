import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH.tsx';
import React from 'react';
import { t } from 'i18next';
import FilemanagerIntroduction from '@/pages/FAQ/sections/userSection/FilemanagerIntroduction.tsx';
import ClassManagementIntroduction from '@/pages/FAQ/sections/userSection/ClassManagementIntroduction.tsx';
import ConferencesIntroduction from '@/pages/FAQ/sections/userSection/ConferencesIntroduction.tsx';
import AiIntroduction from '@/pages/FAQ/sections/userSection/AiIntroduction.tsx';
import PullsIntroduction from '@/pages/FAQ/sections/userSection/PullsIntroduction.tsx';
import LearnManagementIntroduction from '@/pages/FAQ/sections/userSection/LearnManagementIntroduction.tsx';
import WhiteboardIntroduction from '@/pages/FAQ/sections/userSection/WhiteboardIntroduction.tsx';
import VDIIntroduction from '@/pages/FAQ/sections/userSection/VDIIntroduction.tsx';
import EmailIntroduction from '@/pages/FAQ/sections/userSection/EmailIntroduction.tsx';

const FAQPage = () => {
  const faqItems = [
    {
      value: 'filemangerIntroduction',
      title: t('faq.filemangerIntroductionTitle'),
      Component: FilemanagerIntroduction,
    },
    {
      value: 'classManagementIntroduction',
      title: t('faq.classManagementIntroductionTitle'),
      Component: ClassManagementIntroduction,
    },
    { value: 'aiChatIntroduction', title: t('faq.aiChatIntroductionTitle'), Component: AiIntroduction },
    {
      value: 'conferenceIntroduction',
      title: t('faq.conferenceIntroductionTitle'),
      Component: ConferencesIntroduction,
    },
    { value: 'emailIntroduction', title: t('faq.emailIntroductionTitle'), Component: EmailIntroduction },
    {
      value: 'learnManagementIntroduction',
      title: t('faq.learnManagementIntroductionTitle'),
      Component: LearnManagementIntroduction,
    },
    { value: 'pollsIntroduction', title: t('faq.pollsIntroductionTitle'), Component: PullsIntroduction },
    { value: 'vdiIntroduction', title: t('faq.vdiIntroductionTitle'), Component: VDIIntroduction },
    {
      value: 'whiteboardIntroduction',
      title: t('faq.whiteboardIntroductionTitle'),
      Component: WhiteboardIntroduction,
    },
  ];

  return (
    <div className="p-5 lg:px-20">
      <h1 className="mb-1 text-lg">{t('faq.title')}</h1>
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

export default FAQPage;
