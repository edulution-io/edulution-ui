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
import cn from '@libs/common/utils/className';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Label from '@/components/ui/Label';
import Input from '@/components/shared/Input';

const DefaultQuestionOptions = () => {
  const { t } = useTranslation();

  const { questionTitle, setQuestionTitle, questionDescription, setQuestionDescription } =
    useQuestionsContextMenuStore();

  return (
    <div className="my-2 flex flex-col gap-2">
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.questionTitle')}</p>
      </Label>
      <Input
        placeholder={t('survey.editor.questionSettings.addQuestionTitle')}
        type="text"
        variant="dialog"
        value={questionTitle}
        onChange={(e) => setQuestionTitle(e.target.value)}
        className={cn({ 'text-muted-foreground': !questionTitle }, { 'text-primary-foreground': questionTitle })}
      />
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.questionDescription')}</p>
      </Label>
      <Input
        placeholder={t('survey.editor.questionSettings.addQuestionDescription')}
        type="text"
        variant="dialog"
        value={questionDescription}
        onChange={(e) => setQuestionDescription(e.target.value)}
        className={cn(
          { 'text-muted-foreground': !questionDescription },
          { 'text-primary-foreground': questionDescription },
        )}
      />
    </div>
  );
};

export default DefaultQuestionOptions;
