import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import React from 'react';
import { t } from 'i18next';
import FilemanagerIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/FilemanagerIntroduction';
import ClassManagementIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/ClassManagementIntroduction';
import AiIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/AiIntroduction';
import ConferencesIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/ConferencesIntroduction';
import EmailIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/EmailIntroduction';
import LearnManagementIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/LearnManagementIntroduction';
import PullsIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/PullsIntroduction';
import VDIIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/VDIIntroduction';
import WhiteboardIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/WhiteboardIntroduction';
import SurveyIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/SurveyIntroduction.tsx';

const FAQComponent = () => {
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
    { value: 'pullsIntroduction', title: t('faq.pullsIntroductionTitle'), Component: PullsIntroduction },
    { value: 'vdiIntroduction', title: t('faq.vdiIntroductionTitle'), Component: VDIIntroduction },
    {
      value: 'whiteboardIntroduction',
      title: t('faq.whiteboardIntroductionTitle'),
      Component: WhiteboardIntroduction,
    },

    { value: 'surveysIntroduction', title: t('faq.surveysIntroductionTitle'), Component: SurveyIntroduction },
  ];

  return (
    <div>
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

export default FAQComponent;
