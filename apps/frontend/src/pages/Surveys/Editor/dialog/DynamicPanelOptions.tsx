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
import { Input } from '@edulution-io/ui-kit';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Label from '@/components/ui/Label';

const DynamicPanelOptions = () => {
  const { t } = useTranslation();

  const { maxPanelCount, setMaxPanelCount, minPanelCount, setMinPanelCount } = useQuestionsContextMenuStore();

  return (
    <div className="my-2 flex flex-col gap-2">
      <p className="text-m font-bold">{t('survey.editor.questionSettings.panelCount')}</p>
      <p className="b-0 text-sm font-bold text-muted-foreground">
        {t('survey.editor.questionSettings.panelCountLimits')}
      </p>
      <Label>{t('survey.editor.questionSettings.minPanelCount')}</Label>
      <Input
        type="number"
        variant="dialog"
        value={minPanelCount}
        onChange={(e) => {
          setMinPanelCount(Math.min(Number(e.target.value)));
          setMaxPanelCount(Math.max(Number(e.target.value), maxPanelCount));
        }}
        min={0}
        max={100}
        className="text-background"
      />
      <Label>{t('survey.editor.questionSettings.maxPanelCount')}</Label>
      <Input
        type="number"
        variant="dialog"
        value={maxPanelCount}
        onChange={(e) => setMaxPanelCount(Math.max(Number(e.target.value), minPanelCount))}
        min={1}
        max={100}
        className="text-background"
      />
    </div>
  );
};

export default DynamicPanelOptions;
