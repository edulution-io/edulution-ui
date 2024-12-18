import React, { useState, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CircleLoader from '@/components/ui/CircleLoader';
import { MdBlock, MdCropFree } from 'react-icons/md';
import delay from '@libs/common/utils/delay';
import { VEYON_REFRESH_INTERVAL, VEYON_REFRESH_INTERVAL_HIGH } from '@libs/veyon/constants/refreshInterval';
import ImageModal from '@/components/shared/ImageModal';
import useVeyonApiStore from '../../useVeyonApiStore';

type FrameBufferImageProps = {
  user: UserLmnInfo;
};

const FrameBufferImage: React.FC<FrameBufferImageProps> = ({ user }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const { authenticateVeyonClients, getFrameBufferStream, getVeyonUser } = useVeyonApiStore();
  const [connUid, setConnUid] = useState<string>('');
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);

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
    const response = await getFrameBufferStream(connectionUid, isImagePreviewModalOpen);
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

  useInterval(
    () => {
      if (connUid !== '') {
        void fetchImage(connUid);
      }
    },
    isImagePreviewModalOpen ? VEYON_REFRESH_INTERVAL_HIGH : VEYON_REFRESH_INTERVAL,
  );

  const handleImagePreviewClick = () => {
    setIsImagePreviewModalOpen(true);
  };

  const closeImagePreviewModal = () => {
    setIsImagePreviewModalOpen(false);
  };

  const renderContent = () => {
    if (imageSrc) {
      return (
        <>
          <div className="group absolute bottom-3 right-14 rounded-full bg-ciGrey/40 p-3 hover:bg-ciDarkGrey">
            <button
              type="button"
              onClick={() => handleImagePreviewClick()}
              className="relative flex items-center"
            >
              <MdCropFree />
            </button>
          </div>
          <img
            className="h-36 w-64 rounded-xl"
            src={imageSrc}
            alt="framebuffer"
          />
          {isImagePreviewModalOpen && (
            <ImageModal
              isOpen={isImagePreviewModalOpen}
              imageUrl={imageSrc}
              onClose={closeImagePreviewModal}
            />
          )}
        </>
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
