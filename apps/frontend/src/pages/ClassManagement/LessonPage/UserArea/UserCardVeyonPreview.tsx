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

import React from 'react';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import Avatar from '@/components/shared/Avatar';
import getStringFromArray from '@libs/common/utils/getStringFromArray';
import FrameBufferImage from './FrameBufferImage';

interface UserCardVeyonPreviewProps {
  user: LmnUserInfo;
  isVeyonEnabled: boolean;
  areInputDevicesLocked: boolean;
  connectionUid: string;
}

const UserCardVeyonPreview: React.FC<UserCardVeyonPreviewProps> = ({
  user,
  isVeyonEnabled,
  areInputDevicesLocked,
  connectionUid,
}) => {
  if (isVeyonEnabled && getStringFromArray(user.sophomorixIntrinsic3) && connectionUid) {
    return (
      <FrameBufferImage
        user={user}
        areInputDevicesLocked={areInputDevicesLocked}
        connectionUid={connectionUid}
      />
    );
  }

  return (
    <Avatar
      user={{ username: user.name, firstName: user.givenName, lastName: user.sn }}
      imageSrc={user.thumbnailPhoto}
      className={user.thumbnailPhoto && 'h-24 w-24 p-2'}
    />
  );
};

export default UserCardVeyonPreview;
