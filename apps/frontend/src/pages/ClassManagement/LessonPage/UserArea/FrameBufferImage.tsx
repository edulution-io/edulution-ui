/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { MdCropFree } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import CircleLoader from '@/components/ui/CircleLoader';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import FullScreenImage from '@/components/ui/FullScreenImage';
import Avatar from '@/components/shared/Avatar';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { VEYON_REFRESH_INTERVAL, VEYON_REFRESH_INTERVAL_HIGH } from '@libs/veyon/constants/refreshInterval';
import useVeyonApiStore from '../../useVeyonApiStore';

type FrameBufferImageProps = {
  user: UserLmnInfo;
};

const FrameBufferImage: React.FC<FrameBufferImageProps> = ({ user }) => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState<string>('');
  const { userConnectionUids, authenticateVeyonClient, getFrameBufferStream } = useVeyonApiStore();
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);

  const connectionUid = userConnectionUids.find((conn) => conn.veyonUsername === user.name)?.connectionUid || '';

  useEffect(() => {
    if (user.sophomorixIntrinsic3.length > 0) {
      const connIp = user.sophomorixIntrinsic3[0];

      void authenticateVeyonClient(connIp, user.name);
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
    if (connectionUid) {
      void fetchImage();
    } else {
      setImageSrc('');
    }
  }, [connectionUid]);

  useInterval(
    () => {
      if (connectionUid) {
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
              <FullScreenImage imageSrc={imageSrc} />
            </ResizableWindow>
          )}
        </div>
      );
    }

    if (connectionUid) {
      return <CircleLoader />;
    }

    return (
      <Avatar
        user={{ username: user.name, firstName: user.givenName, lastName: user.sn }}
        imageSrc={user.thumbnailPhoto}
        className={user.thumbnailPhoto && 'h-24 w-24 p-2'}
      />
    );
  };

  return renderContent();
};

export default FrameBufferImage;
