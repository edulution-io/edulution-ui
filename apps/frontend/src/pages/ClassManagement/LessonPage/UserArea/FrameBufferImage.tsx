import React, { useState, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CircleLoader from '@/components/ui/CircleLoader';
import { MdBlock, MdCropFree } from 'react-icons/md';
import { VEYON_REFRESH_INTERVAL, VEYON_REFRESH_INTERVAL_HIGH } from '@libs/veyon/constants/refreshInterval';
import ImageModal from '@/components/shared/ImageModal';
import useVeyonApiStore from '../../useVeyonApiStore';

type FrameBufferImageProps = {
  user: UserLmnInfo;
};

const FrameBufferImage: React.FC<FrameBufferImageProps> = ({ user }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const { authenticateVeyonClients, getFrameBufferStream } = useVeyonApiStore();
  const [connUid, setConnUid] = useState<string>('');
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);

  useEffect(() => {
    if (user.sophomorixIntrinsic3.length > 0) {
      const connIp = user.sophomorixIntrinsic3[0];

      const getConnUid = async () => {
        const connectionUid = await authenticateVeyonClients(connIp, user.name);
        setConnUid(connectionUid);
      };

      void getConnUid();
    }
  }, [user]);

  const fetchImage = async (connectionUid: string) => {
    const image = await getFrameBufferStream(connectionUid, isImagePreviewModalOpen);
    if (!image.size) return null;

    const imageURL = URL.createObjectURL(image);
    setImageSrc(imageURL);
    return () => URL.revokeObjectURL(imageURL);
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
        <div className="relative inline-block">
          <img
            className="h-36 w-64 rounded-xl"
            src={imageSrc}
            alt="framebuffer"
          />

          <div className="group absolute bottom-3 right-3 rounded-full bg-ciGrey/40 p-3 hover:bg-ciDarkGrey">
            <button
              type="button"
              onClick={() => handleImagePreviewClick()}
              className="relative flex items-center"
            >
              <MdCropFree />
            </button>
          </div>

          {isImagePreviewModalOpen && (
            <ImageModal
              isOpen={isImagePreviewModalOpen}
              imageUrl={imageSrc}
              onClose={closeImagePreviewModal}
            />
          )}
        </div>
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
