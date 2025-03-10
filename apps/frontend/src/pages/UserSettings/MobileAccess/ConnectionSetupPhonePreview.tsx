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

interface ConnectionSetupProps {
  username: string;
  schoolname: string;
  schoolurl: string;
}

const ConnectionSetupPhonePreview: React.FC<ConnectionSetupProps> = ({ username, schoolurl, schoolname }) => (
  <div className="flex h-[550px] w-[360px] flex-col overflow-hidden rounded-md bg-gray-900 text-white shadow-lg">
    <div className="flex items-center bg-gray-800 p-4">
      <button
        type="button"
        className="mr-2"
        disabled
      >
        <MdArrowBackIosNew className="h-5 w-5 text-white" />
      </button>
      <h1 className="text-lg font-bold">{t('mobileAccessSetup.connectionTitle')}</h1>
    </div>

    <div className="flex flex-grow flex-col gap-4 p-4">
      <p className="text-base">{t('mobileAccessSetup.pleaseEnterCredentials')}</p>

      <div className="flex cursor-pointer items-center justify-center text-blue-400">
        <FaQrcode className="mr-1" />
        <span>{t('mobileAccessSetup.scanQrCode')}</span>
      </div>

      <div className="my-2 flex items-center">
        <hr className="flex-grow border-gray-600" />
        <span className="mx-2 text-gray-400">{t('mobileAccessSetup.orText')}</span>
        <hr className="flex-grow border-gray-600" />
      </div>

      <div className="w-full rounded bg-gray-800 p-3 text-orange-400">{schoolname}</div>
      <div className="w-full whitespace-normal break-words rounded bg-gray-800 p-3 text-orange-400">{schoolurl}</div>
      <div className="w-full rounded bg-gray-800 p-3 text-orange-400">{username}</div>
      <div className="w-full rounded bg-gray-800 p-3 text-orange-400">{t('mobileAccessSetup.yourPassword')}</div>

      <button
        type="button"
        className="mt-2 cursor-not-allowed rounded bg-blue-600 p-3 text-center font-semibold text-white opacity-60"
        disabled
      >
        {t('mobileAccessSetup.addButton')}
      </button>
    </div>
  </div>
);

export default ConnectionSetupPhonePreview;
