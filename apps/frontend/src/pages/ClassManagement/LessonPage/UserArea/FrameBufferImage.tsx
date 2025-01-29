import React, { useState, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { MdBlock, MdCropFree } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import CircleLoader from '@/components/ui/CircleLoader';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { VEYON_REFRESH_INTERVAL, VEYON_REFRESH_INTERVAL_HIGH } from '@libs/veyon/constants/refreshInterval';
import useVeyonApiStore from '../../useVeyonApiStore';

type FrameBufferImageProps = {
  user: UserLmnInfo;
};

const FrameBufferImage: React.FC<FrameBufferImageProps> = ({ user }) => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState<string>('');
  const { userConnectionUids, authenticateVeyonClients, getFrameBufferStream } = useVeyonApiStore();
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);

  const connectionUid = userConnectionUids.find((conn) => conn.veyonUsername === user.name)?.connectionUid || '';

  useEffect(() => {
    if (user.sophomorixIntrinsic3.length > 0) {
      const connIp = user.sophomorixIntrinsic3[0];

      void authenticateVeyonClients(connIp, user.name);
    }
  }, [user]);

  const fetchImage = async () => {
    const image = await getFrameBufferStream(connectionUid, isImagePreviewModalOpen);
    if (!image.size) return null;

    const imageURL = URL.createObjectURL(image);
    setImageSrc(imageURL);
    return () => URL.revokeObjectURL(imageURL);
  };

  useEffect(() => {
    if (connectionUid !== '') {
      void fetchImage();
    }
  }, [connectionUid]);

  useInterval(
    () => {
      if (connectionUid !== '') {
        void fetchImage();
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
            alt={t('framebufferImage')}
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
            <ResizableWindow
              disableMinimizeWindow
              disableToggleMaximizeWindow
              titleTranslationId={t('preview.image')}
              handleClose={closeImagePreviewModal}
            >
              <div className="flex h-full w-full items-center justify-center bg-foreground">
                <img
                  src={imageSrc}
                  alt={t('previewImage')}
                  className="max-h-screen max-w-full rounded-md"
                />
              </div>
            </ResizableWindow>
          )}
        </div>
      );
    }

    if (connectionUid !== '') {
      return <CircleLoader />;
    }

    return <MdBlock />;
  };

  return renderContent();
};

export default FrameBufferImage;
