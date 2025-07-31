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

import React, { useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { MdCropFree } from 'react-icons/md';
import { TbKeyboardOff } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import FullScreenImage from '@/components/ui/FullScreenImage';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import { VEYON_REFRESH_INTERVAL, VEYON_REFRESH_INTERVAL_HIGH } from '@libs/veyon/constants/refreshInterval';
import useVeyonApiStore from '../../useVeyonApiStore';

type FrameBufferImageProps = {
  user: LmnUserInfo;
  areInputDevicesLocked: boolean;
  connectionUid: string;
};

const FrameBufferImage: React.FC<FrameBufferImageProps> = ({ areInputDevicesLocked, connectionUid }) => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState<string>('');
  const { loadingFeatureUids, getFrameBufferStream } = useVeyonApiStore();
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);

  const fetchImage = async () => {
    const image = await getFrameBufferStream(connectionUid, isImagePreviewModalOpen);
    if (!image.size) {
      setImageSrc('');
      return null;
    }

    const imageURL = URL.createObjectURL(image);
    setImageSrc(imageURL);
    return () => URL.revokeObjectURL(imageURL);
  };

  useEffect(() => {
    if (connectionUid) {
      void fetchImage();
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

          {areInputDevicesLocked && (
            <div className="group absolute left-1 top-1">
              <TbKeyboardOff className="h-5 w-5 text-ciRed" />
            </div>
          )}

          <div className="group absolute bottom-3 right-3 rounded-full bg-ciGrey/40 p-3 hover:bg-ciDarkGrey">
            <button
              type="button"
              onClick={() => handleImagePreviewClick()}
              className="relative flex items-center"
            >
              {loadingFeatureUids.has(connectionUid) ? (
                <CircleLoader
                  height="h-6"
                  width="w-6"
                />
              ) : (
                <MdCropFree />
              )}
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

    return <CircleLoader />;
  };

  return renderContent();
};

export default FrameBufferImage;
