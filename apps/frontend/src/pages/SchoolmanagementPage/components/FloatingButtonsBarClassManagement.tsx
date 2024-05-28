import React from 'react';
import { RiShareForward2Line } from 'react-icons/ri';
import { MdOutlineFileDownload } from 'react-icons/md';
import { FiPrinter } from 'react-icons/fi';
import { AiOutlineGlobal } from 'react-icons/ai';
import { FaWifi, FaGraduationCap } from 'react-icons/fa';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { t } from 'i18next';
import FloatingActionButton from '@/components/ui/FloatingActionButton.tsx';

const FloatingButtonsBarClassManagement = () => (
  <div className="fixed bottom-8 flex flex-row space-x-8 bg-opacity-90">
    <TooltipProvider>
      <div className="flex flex-row items-center space-x-8">
        <FloatingActionButton
          icon={RiShareForward2Line}
          text={t('schoolManagement.share')}
        />
        <FloatingActionButton
          icon={RiShareForward2Line}
          text={t('schoolManagement.collect')}
        />
        <FloatingActionButton
          icon={MdOutlineFileDownload}
          text={t('schoolManagement.showCollectedFiles')}
        />
        <FloatingActionButton
          icon={FaGraduationCap}
          text={t('schoolManagement.exam')}
        />
        <FloatingActionButton
          icon={FaWifi}
          text={t('schoolManagement.wifi')}
        />
        <FloatingActionButton
          icon={AiOutlineGlobal}
          text={t('schoolManagement.internet')}
        />
        <FloatingActionButton
          icon={FiPrinter}
          text={t('schoolManagement.printer')}
        />
      </div>
    </TooltipProvider>
  </div>
);

export default FloatingButtonsBarClassManagement;
