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
import { Card } from '@/components/shared/Card';
import Input from '@/components/shared/Input';
import Separator from '@/components/ui/Separator';

interface PublicSurveyParticipationIdDisplayProps {
  publicUserId: string;
}

const PublicSurveyParticipationIdDisplay = ({ publicUserId }: PublicSurveyParticipationIdDisplayProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card
        variant="text"
        className="w-[660px] max-w-[660px] border-none bg-white bg-opacity-5 p-5 md:w-[60%]"
      >
        <div className="mb-6 mt-2 flex flex-row items-center justify-center">
          <h3>{t('survey.thanks')}</h3>
        </div>

        <Separator className="my-4" />

        <h4 className="my-4 mt-0 ">{t('survey.participate.idHeader')}</h4>

        <div className="mx-4">
          <p>{t('survey.participate.idText')}</p>
          <div className="mx-8 my-4 flex flex-row items-center justify-center">
            <Input
              type="text"
              value={publicUserId}
              readOnly
              className="w-[560px] cursor-pointer"
              onClick={() => copyToClipboard(publicUserId)}
              icon={<MdFileCopy />}
            />
          </div>
        </div>

        <p>{t('survey.participate.idParagraph')}</p>
      </Card>
    </div>
  );
};

export default PublicSurveyParticipationIdDisplay;
