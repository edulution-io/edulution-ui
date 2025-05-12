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
import { useTranslation } from 'react-i18next';
import { MdFileCopy } from 'react-icons/md';
import copyToClipboard from '@/utils/copyToClipboard';
import Input from '@/components/shared/Input';

interface PublicSurveyParticipationIdProps {
  publicUserId: string;
}

const PublicSurveyParticipationId = ({ publicUserId }: PublicSurveyParticipationIdProps) => {
  const { t } = useTranslation();

  if (!publicUserId) {
    return null;
  }

  return (
    <div className="relative top-1/3 mx-auto my-10 w-[90%] max-w-[500px] rounded-xl bg-white bg-opacity-5 p-5 md:w-[60%]">
      <h4 className="my-4 mt-0 ">{t('survey.participate.idHeader')}</h4>

      <div className="mx-4">
        <p>{t('survey.participate.idText')}</p>
        <div className="mx-8 my-4 flex flex-row items-center justify-center">
          <Input
            type="text"
            value={publicUserId}
            readOnly
            className="w-[400px] cursor-pointer"
            onClick={() => copyToClipboard(publicUserId)}
            icon={<MdFileCopy />}
          />
        </div>
      </div>

      <p>{t('survey.participate.idFooter')}</p>
    </div>
  );
};

export default PublicSurveyParticipationId;
