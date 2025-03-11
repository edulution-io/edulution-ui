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
import { MdArrowBackIosNew } from 'react-icons/md';
import { FaQrcode } from 'react-icons/fa';
import { t } from 'i18next';
import { Button } from '@/components/shared/Button';
import { IoMdAdd } from 'react-icons/io';

interface ConnectionSetupProps {
  username: string;
  schoolname: string;
  schoolurl: string;
}

const ConnectionSetupPhonePreview: React.FC<ConnectionSetupProps> = ({ username, schoolurl, schoolname }) => (
  <div className="flex h-[550px] w-[360px] flex-col overflow-hidden rounded-md text-background shadow-lg">
    <div className="relative flex items-center justify-center bg-accent p-4">
      <MdArrowBackIosNew className="absolute left-4 h-5 w-5 text-background" />
      <p className="text-lg font-bold">{t('mobileAccessSetup.connectionTitle')}</p>
    </div>

    <div className="flex flex-grow flex-col justify-center gap-4 p-4">
      <p className="text-center text-base">{t('mobileAccessSetup.pleaseEnterCredentials')}</p>

      <div className="flex cursor-pointer items-center justify-center text-ciGreen">
        <FaQrcode className="mr-1" />
        <span>{t('mobileAccessSetup.scanQrCode')}</span>
      </div>

      <div className="my-2 flex items-center">
        <hr className="flex-grow border-secondary" />
        <span className="mx-2 text-secondary">{t('mobileAccessSetup.orText')}</span>
        <hr className="flex-grow border-secondary" />
      </div>

      <div className="w-full rounded bg-accent p-3 text-background">{schoolname}</div>
      <div className="w-full whitespace-normal break-words rounded bg-accent p-3 text-background">{schoolurl}</div>
      <div className="w-full rounded bg-accent p-3 text-background">{username}</div>
      <div className="w-full rounded bg-accent p-3 text-background">{t('mobileAccessSetup.yourPassword')}</div>

      <Button
        className="h-12 w-full"
        variant="btn-security"
      >
        <IoMdAdd />
        {t('mobileAccessSetup.addButton')}
      </Button>
    </div>
  </div>
);

export default ConnectionSetupPhonePreview;
