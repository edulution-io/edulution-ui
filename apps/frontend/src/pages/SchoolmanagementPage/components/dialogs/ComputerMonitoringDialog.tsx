import { DialogContentSH, DialogSH, DialogTitleSH } from '@/components/ui/DialogSH.tsx';
import React, { FC } from 'react';
import ReactPlayer from 'react-player';
import linuxRec from 'apps/frontend/src/pages/SchoolmanagementPage/mockVyron/linuxRec.mp4';

interface ComputerMonitoringDialogProps {
  username: string;
  videoUrl: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenChange: (isOpen: boolean) => void;
}

const ComputerMonitoringDialog: FC<ComputerMonitoringDialogProps> = ({
  username,
  videoUrl,
  isOpen,
  setIsOpen,
  onOpenChange,
}) => {
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  return (
    <DialogSH
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContentSH variant="large">
        <DialogTitleSH>{username}</DialogTitleSH>
        <ReactPlayer
          url={videoUrl || linuxRec}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
          }}
          playing
          loop
          width="100%"
          height="100%"
          className="absolute left-0 top-0"
        />
      </DialogContentSH>
    </DialogSH>
  );
};

export default ComputerMonitoringDialog;
