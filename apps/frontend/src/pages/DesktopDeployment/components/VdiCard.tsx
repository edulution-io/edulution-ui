import React, { FC } from 'react';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { LinuxLogo, WindowsLogo } from '@/assets/logos';
import { Card } from '@/components/shared/Card';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';

interface CardProps {
  title: string;
  availableClients: number;
  onClick: () => void;
  osType: VirtualMachineOs;
  disabled?: boolean;
}

const VdiCard: FC<CardProps> = ({ title, availableClients = 0, onClick, osType, disabled = false }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="grid w-72 grid-cols-3 gap-4 border border-gray-200 p-4 shadow"
      aria-label={title}
    >
      <div className="col-span-1 flex items-center justify-center">
        <img
          src={osType === VirtualMachineOs.UBUNTU ? LinuxLogo : WindowsLogo}
          alt="os_logo"
          className="h-12 w-12"
        />
      </div>
      <div className="col-span-2">
        <h4>{title}</h4>
        <p>{`${availableClients} ${t('desktopdeployment.clients')}`}</p>
      </div>
      <div className="col-span-3 flex justify-end">
        <Button
          variant="btn-collaboration"
          size="sm"
          onClick={onClick}
          disabled={disabled}
        >
          {t('common.start')}
        </Button>
      </div>
    </Card>
  );
};

export default VdiCard;
