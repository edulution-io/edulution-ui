import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiShareForward2Line } from 'react-icons/ri';
import { TfiReload } from 'react-icons/tfi';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

type FloatingButtonsProps = {
  handleConnect: () => void;
  handleReload: () => void;
};

const FloatingButtonsBar: React.FC<FloatingButtonsProps> = ({ handleConnect, handleReload }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-8 flex flex-row bg-opacity-90">
      <FloatingActionButton
        icon={RiShareForward2Line}
        text={t('desktopdeployment.connect')}
        onClick={() => handleConnect()}
      />

      <FloatingActionButton
        icon={TfiReload}
        text={t('desktopdeployment.reload')}
        onClick={() => handleReload()}
      />
    </div>
  );
};

export default FloatingButtonsBar;
