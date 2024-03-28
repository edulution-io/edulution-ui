import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import Sidebar from '@/components/ui/Sidebar';
import backgroundImage from '@/assets/background.jpg';
import { ConfigType } from '@/datatypes/types';

const IframeLayout: React.FC = () => {
  const location = useLocation();

  const [config] = useLocalStorage<ConfigType>('edu-config', {});

  return (
    <div
      className="flex bg-cover bg-center opacity-90"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="h-screen w-full">
        <iframe
          className="h-screen w-full pr-[58px]"
          title={location.pathname}
          src={config[location.pathname.split('/')[1]]?.linkPath}
        />
      </div>
      <Sidebar />
    </div>
  );
};

export default IframeLayout;
