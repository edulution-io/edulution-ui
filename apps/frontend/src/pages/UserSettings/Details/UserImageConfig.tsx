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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CHAT_PROFILE_PICTURE_ENDPOINT } from '@libs/chat/constants/chatApiEndpoints';
import useLmnApiStore from '@/store/useLmnApiStore';
import { Button } from '@edulution-io/ui-kit';
import getCompressedImage from '@/utils/getCompressedImage';
import Avatar from '@/components/shared/Avatar';
import eduApi from '@/api/eduApi';
import { toast } from 'sonner';

const UserImageConfig: React.FC = () => {
  const { t } = useTranslation();
  const { user, patchUserDetails } = useLmnApiStore();
  const [base64Image, setBase64Image] = useState<string>(user?.thumbnailPhoto ?? '');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      let compressedBase64: string;
      try {
        compressedBase64 = await getCompressedImage(file, 100);
      } catch (error) {
        toast.error(t(error instanceof Error ? error.message : 'usersettings.errors.notAbleToCompressImage'));
        compressedBase64 = '';
      }
      setBase64Image(compressedBase64);
    }
  };

  const handleSubmitImage = async () => {
    await patchUserDetails({ thumbnailPhoto: base64Image });
    try {
      await eduApi.put(CHAT_PROFILE_PICTURE_ENDPOINT, { profilePicture: base64Image });
    } catch {
      toast.error(t('usersettings.errors.profilePictureCacheUpdateFailed'));
    }
  };

  const handleImageDelete = async () => {
    setBase64Image('');
    await patchUserDetails({ thumbnailPhoto: '' });
    try {
      await eduApi.put(CHAT_PROFILE_PICTURE_ENDPOINT, { profilePicture: '' });
    } catch {
      toast.error(t('usersettings.errors.profilePictureCacheUpdateFailed'));
    }
  };

  return (
    <div className="space-y-4 py-4 text-ciGrey">
      <Avatar
        user={{ username: user?.name || '', firstName: user?.givenName, lastName: user?.sn }}
        imageSrc={base64Image}
        className="h-20 w-20"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mt-4"
      />

      <div className="mt-4 flex justify-end gap-4">
        {base64Image ? (
          <Button
            variant="btn-attention"
            size="lg"
            onClick={handleImageDelete}
          >
            {t('common.delete')}
          </Button>
        ) : null}
        <Button
          variant="btn-security"
          size="lg"
          onClick={handleSubmitImage}
          disabled={!base64Image}
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default UserImageConfig;
