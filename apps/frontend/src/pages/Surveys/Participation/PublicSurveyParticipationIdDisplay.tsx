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
    <div className="flex min-h-dvh items-center justify-center">
      <Card
        variant="text"
        className="w-[660px] max-w-[660px] border-none bg-white bg-opacity-5 p-5 md:w-[60%]"
      >
        <div className="mb-6 mt-2 flex flex-row items-center justify-center">
          <h2>{t('survey.thanks')}</h2>
        </div>

        <Separator className="my-4" />

        <h3 className="my-4 mt-0 ">{t('survey.participate.idHeader')}</h3>

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
