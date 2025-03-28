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
import { useTranslation } from 'react-i18next';
import copyToClipboard from '@/utils/copyToClipboard';
import { Button } from '@/components/shared/Button';

interface PublicSurveyParticipationIdProps {
  publicParticipationId?: string;
  reset: () => void;
}

const PublicSurveyParticipationId = ({ publicParticipationId, reset }: PublicSurveyParticipationIdProps) => {
  const { t } = useTranslation();

  const [timeOut, setTimeOut] = useState<number>(60000);

  useEffect(() => {
    if (timeOut <= 0) {
      reset();
    }
    const updatedTime = timeOut - 1000;
    setTimeout(() => setTimeOut(updatedTime), 1000);
  }, [timeOut]);

  const toasterTranslations = {
    success: 'survey.participate.idCopySuccess',
    error: 'survey.participate.idCopyError',
  };

  if (!publicParticipationId) {
    return null;
  }
  return (
    <div className="mx-auto my-10 w-[90%] rounded-xl bg-white bg-opacity-5 p-5 md:w-[400px]">
      <h4 className="my-4 mt-0 ">{t('survey.participate.idHeader')}</h4>
      <p>{t('survey.participate.idText')}</p>
      <div className="my-4 flex flex-row items-center justify-center">
        <div className="mb-2 mt-2 rounded-xl bg-muted px-3 py-2 text-center">{publicParticipationId}</div>
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
      <hr className="my-6 flex-grow border-t border-gray-300" />
      <div className="flex items-center justify-end">
        <p className="text-secondary">{t('survey.participate.idTimer', { time: timeOut / 1000 })} </p>
      </div>
    </div>
  );
};

export default PublicSurveyParticipationId;
