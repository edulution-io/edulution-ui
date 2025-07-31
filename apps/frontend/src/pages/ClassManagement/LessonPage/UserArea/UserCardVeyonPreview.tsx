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
