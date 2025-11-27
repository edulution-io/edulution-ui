/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
