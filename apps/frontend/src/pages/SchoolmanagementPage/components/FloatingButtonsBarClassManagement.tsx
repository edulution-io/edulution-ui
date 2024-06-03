import React from 'react';
import { RiShareForward2Line } from 'react-icons/ri';
import { MdOutlineFileDownload } from 'react-icons/md';
import { FiPrinter } from 'react-icons/fi';
import { AiOutlineGlobal } from 'react-icons/ai';
import { FaGraduationCap, FaWifi } from 'react-icons/fa';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { t } from 'i18next';
import FloatingActionButton from '@/components/ui/FloatingActionButton.tsx';

interface FloatingButtonsBarClassManagementProps {
  setShareState: () => void;
  setCollectState: () => void;
  setShowFilesState: () => void;
  setExamState: () => void;
  setWifiState: () => void;
  setInternetState: () => void;
  setPrinterState: () => void;
}

const FloatingButtonsBarClassManagement: React.FC<FloatingButtonsBarClassManagementProps> = ({
  setShareState,
  setCollectState,
  setShowFilesState,
  setExamState,
  setWifiState,
  setInternetState,
  setPrinterState,
}) => (
  <div className="fixed bottom-8 flex flex-row space-x-8 bg-opacity-90">
    <TooltipProvider>
      <div className="flex flex-row items-center space-x-8">
        <FloatingActionButton
          icon={RiShareForward2Line}
          text={t('schoolManagement.share')}
          onClick={setShareState}
        />
        <FloatingActionButton
          icon={(props) => (
            <div style={{ transform: 'scaleX(-1)' }}>
              <RiShareForward2Line {...props} />
            </div>
          )}
          text={t('schoolManagement.collect')}
          onClick={setCollectState}
        />
        <FloatingActionButton
          icon={MdOutlineFileDownload}
          text={t('schoolManagement.showCollectedFiles')}
          onClick={setShowFilesState}
        />
        <FloatingActionButton
          icon={FaGraduationCap}
          text={t('schoolManagement.exam')}
          onClick={setExamState}
        />
        <FloatingActionButton
          icon={FaWifi}
          text={t('schoolManagement.wifi')}
          onClick={setWifiState}
        />
        <FloatingActionButton
          icon={AiOutlineGlobal}
          text={t('schoolManagement.internet')}
          onClick={setInternetState}
        />
        <FloatingActionButton
          icon={FiPrinter}
          text={t('schoolManagement.printer')}
          onClick={setPrinterState}
        />
      </div>
    </TooltipProvider>
  </div>
);

export default FloatingButtonsBarClassManagement;
