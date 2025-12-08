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
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Switch from '@/components/ui/Switch';
import Input from '@/components/shared/Input';
import Label from '@/components/ui/Label';

const ChoicesWithBackendLimitsShowOtherItem = () => {
  const {
    selectedQuestion,
    useBackendLimits,
    showOtherItem,
    toggleShowOtherItem,
    setChoiceLimit,
    currentChoices,
    addChoice,
  } = useQuestionsContextMenuStore();

  const { t } = useTranslation();

  const handleToggleShowOtherItem = () => {
    if (!selectedQuestion) return;

    selectedQuestion.showOtherItem = !showOtherItem;

    toggleShowOtherItem();
  };

  const otherItemsChoiceWithBackendLimit = currentChoices.find((choice) => choice.name === SHOW_OTHER_ITEM);

  return (
    <div className="ml-2 flex-1 items-center text-foreground">
      <div className="ml-2 inline-flex">
        <Switch
          checked={showOtherItem}
          onCheckedChange={handleToggleShowOtherItem}
          className={cn(
            { 'text-muted-foreground': !useBackendLimits },
            { 'text-primary-foreground': useBackendLimits },
          )}
        />
        <p className="ml-2 text-sm font-bold text-primary-foreground">
          {t('survey.editor.questionSettings.useOtherItem')}
        </p>
      </div>
      {showOtherItem ? (
        <>
          <p className="ml-4 mt-2 text-sm text-primary-foreground">
            {t('survey.editor.questionSettings.addBackendLimiterForOtherItem')}
          </p>
          <div className="ml-4 inline-flex items-center">
            <Label className="text-m flex-0 font-bold text-primary-foreground">
              {t('survey.editor.questionSettings.limit')}:
            </Label>
            <Input
              type="number"
              min="0"
              placeholder={t('common.limit')}
              value={otherItemsChoiceWithBackendLimit?.limit || 1}
              onChange={(e) =>
                otherItemsChoiceWithBackendLimit
                  ? setChoiceLimit(SHOW_OTHER_ITEM, Math.max(Number(e.target.value), 0))
                  : addChoice(SHOW_OTHER_ITEM, SHOW_OTHER_ITEM, Math.max(Number(e.target.value), 0))
              }
              variant="dialog"
              className="ml-2 mt-2 max-w-[80px] flex-1 text-primary-foreground"
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChoicesWithBackendLimitsShowOtherItem;
