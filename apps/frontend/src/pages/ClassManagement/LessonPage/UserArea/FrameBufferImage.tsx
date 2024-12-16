import React, { useState, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CircleLoader from '@/components/ui/CircleLoader';
import useVeyonApiStore from '../../useVeyonApiStore';

type FrameBufferImageProps = {
  user: UserLmnInfo;
};

const FrameBufferImage: React.FC<FrameBufferImageProps> = ({ user }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const { authenticateVeyonClients, getFrameBufferStream } = useVeyonApiStore();
  const [connUid, setConUid] = useState<string>('');

  useEffect(() => {
    if (user.sophomorixIntrinsic3.length > 0) {
      const connIp = user.sophomorixIntrinsic3[0];

      const getConnUid = async () => {
        try {
          const response = await authenticateVeyonClients(connIp);
          setConUid(response);
        } catch (error) {
          console.error(error);
        }
      };

      void getConnUid();
    }
  }, [user]);

  useEffect(() => {
    if (connUid === '') {
      return;
    }
    const fetchImage = async () => {
      const response = await getFrameBufferStream(connUid);
      if (response === null) return;
      const objectURL = URL.createObjectURL(response);
      setImageSrc(objectURL);
    };

    void fetchImage();
  }, []);

  const delay = 5000;

  useInterval(() => {
    if (connUid === '') {
      return;
    }
    const fetchImage = async () => {
      if (connUid === '') {
        return;
      }
      try {
        const response = await getFrameBufferStream(connUid);
        if (response === null) return;
        const objectURL = URL.createObjectURL(response);
        setImageSrc(objectURL);
      } catch (error) {
        console.error('Error fetching the image:', error);
      }
    };

    void fetchImage();
  }, delay);

  return imageSrc ? (
    <img
      src={imageSrc}
      alt="framebuffer"
    />
  ) : (
    connUid !== '' && <CircleLoader />
  );
};

export default FrameBufferImage;
