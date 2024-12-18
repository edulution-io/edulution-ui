import React, { useState, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CircleLoader from '@/components/ui/CircleLoader';
import { MdBlock } from 'react-icons/md';
import delay from '@libs/common/utils/delay';
import VEYON_REFRESH_INTERVAL from '@libs/veyon/constants/refreshInterval';
import useVeyonApiStore from '../../useVeyonApiStore';

type FrameBufferImageProps = {
  user: UserLmnInfo;
};

const FrameBufferImage: React.FC<FrameBufferImageProps> = ({ user }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const { authenticateVeyonClients, getFrameBufferStream, getVeyonUser } = useVeyonApiStore();
  const [connUid, setConnUid] = useState<string>('');

  const verifyVeyonUser = async (connectionUid: string) => {
    const veyonUser = await getVeyonUser(connectionUid);
    if (!veyonUser || !veyonUser.login) return false;

    const veyonUsername = veyonUser.login.split('\\')[1];
    return veyonUsername === user.name;
  };

  useEffect(() => {
    if (user.sophomorixIntrinsic3.length > 0) {
      const connIp = user.sophomorixIntrinsic3[0];

      const getConnUid = async () => {
        const connectionUid = await authenticateVeyonClients(connIp);
        if (connectionUid !== '') {
          await delay(500);
          const isVeyonUserActualUser = await verifyVeyonUser(connectionUid);
          setConnUid(isVeyonUserActualUser ? connectionUid : '');
        }
      };

      void getConnUid();
    }
  }, [user]);

  const fetchImage = async (connectionUid: string) => {
    const response = await getFrameBufferStream(connectionUid);
    if (!response) return null;

    const objectURL = URL.createObjectURL(response);
    setImageSrc(objectURL);

    return () => URL.revokeObjectURL(objectURL);
  };

  useEffect(() => {
    if (connUid !== '') {
      void fetchImage(connUid);
    }
  }, [connUid]);

  useInterval(() => {
    if (connUid !== '') {
      void fetchImage(connUid);
    }
  }, VEYON_REFRESH_INTERVAL);

  const renderContent = () => {
    if (imageSrc) {
      return (
        <img
          className="rounded-xl"
          src={imageSrc}
          alt="framebuffer"
        />
      );
    }

    if (connUid !== '') {
      return <CircleLoader />;
    }

    return <MdBlock />;
  };

  return renderContent();
};

export default FrameBufferImage;
