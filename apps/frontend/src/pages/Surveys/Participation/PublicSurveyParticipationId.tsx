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
import copyToClipboard from '@/utils/copyToClipboard';
import { Button } from '@/components/shared/Button';

interface PublicSurveyParticipationIdProps {
  publicParticipationId?: string;
}

const PublicSurveyParticipationId = ({ publicParticipationId }: PublicSurveyParticipationIdProps) => {
  const { t } = useTranslation();

  const toasterTranslations = {
    success: 'survey.participate.idCopySuccess',
    error: 'survey.participate.idCopyError',
  };

  if (!publicParticipationId) {
    return null;
  }
  return (
    <div className="mx-auto my-10 w-[90%] rounded-xl bg-white bg-opacity-5 p-5 md:w-[60%]">
      <h4 className="my-4 mt-0 ">{t('survey.participate.idHeader')}</h4>
      <p>{t('survey.participate.idText')}</p>
      <div className="my-4 flex flex-row items-center justify-center">
        <p className="mb-2 mt-2 rounded-xl bg-muted px-3 py-2 text-center">{publicParticipationId}</p>
        <Button
          size="md"
          type="button"
          variant="btn-collaboration"
          onClick={() => copyToClipboard(publicParticipationId, toasterTranslations)}
          className="mx-4"
        >
          {t('common.copy.doCopy')}
        </Button>
      </div>
      <p>{t('survey.participate.idFooter')}</p>
    </div>
  );
};

export default PublicSurveyParticipationId;
