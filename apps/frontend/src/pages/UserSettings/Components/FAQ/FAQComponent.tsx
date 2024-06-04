import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import React from 'react';
import { t } from 'i18next';
import FilemanagerIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/FilemanagerIntroduction';
import ClassManagementIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/ClassManagementIntroduction';
import AiIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/AiIntroduction';
import ConferencesIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/ConferencesIntroduction';
import EmailIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/EmailIntroduction';
import LearnManagementIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/LearnManagementIntroduction';
import VDIIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/VDIIntroduction';
import WhiteboardIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/WhiteboardIntroduction';
import SurveyIntroduction from '@/pages/UserSettings/Components/FAQ/sections/userSection/SurveyIntroduction.tsx';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { FAQIcon } from '@/assets/icons';
import { useMediaQuery } from 'usehooks-ts';
import cn from '@/lib/utils';

const FAQComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    { value: 'vdiIntroduction', title: t('faq.vdiIntroductionTitle'), Component: VDIIntroduction },
    {
      value: 'whiteboardIntroduction',
      title: t('faq.whiteboardIntroductionTitle'),
      Component: WhiteboardIntroduction,
    },

    { value: 'surveysIntroduction', title: t('faq.surveysIntroductionTitle'), Component: SurveyIntroduction },
  ];

  return (
    <div className={cn('absolute bottom-[32px] right-[57px] top-3 h-screen', isMobile ? 'left-4' : 'left-[256px]')}>
      <NativeAppHeader
        title={t('faq.title')}
        description={t('faq.description')}
        iconSrc={FAQIcon}
      />
      <div className="p-4">
        <AccordionSH type="multiple">
          {faqItems.map(({ value, title, Component }) => (
            <AccordionItem
              key={value}
              value={value}
              className={'mb-4'}
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
