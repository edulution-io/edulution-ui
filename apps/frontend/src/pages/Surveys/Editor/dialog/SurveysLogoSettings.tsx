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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import cn from '@libs/common/utils/className';
import Label from '@/components/ui/Label';
import Input from '@/components/shared/Input';
import { SurveyCreatorModel } from 'survey-creator-core';

interface SurveysLogoSettingsProps {
  form: UseFormReturn<SurveyDto>;
  surveyCreator: SurveyCreatorModel;
}

const SurveysLogoSettings = ({ form, surveyCreator }: SurveysLogoSettingsProps) => {
  const { t } = useTranslation();

  const [surveyLogoWidth, setSurveyLogoWidth] = React.useState<number>(0);

  useEffect(() => {
    const formula = form.watch('formula');
    if (!formula) return;
    setSurveyLogoWidth(Number(formula.logoWidth?.replace('px', '').replace(/\D/g, '') || '0'));
  }, []);

  useEffect(() => {
    const formula = form.watch('formula');
    if (!formula) return;
    formula.logoWidth = surveyLogoWidth ? `${Math.max(100, surveyLogoWidth)}px` : 'auto';
    form.setValue('formula', formula);
    // eslint-disable-next-line no-param-reassign
    surveyCreator.JSON = formula;
  }, [surveyLogoWidth]);

  return (
    <div className="my-2 flex flex-col gap-2">
      <Label>
        <p className="font-bold">{t('survey.editor.surveySettings.surveyLogoWidth')}</p>
      </Label>
      <Input
        type="number"
        placeholder={t('survey.editor.surveySettings.surveyLogoWidthPlaceholder')}
        variant="dialog"
        value={surveyLogoWidth === 0 ? '' : surveyLogoWidth}
        onChange={(e) => setSurveyLogoWidth(Number(e.target.value) || 0)}
        className={cn({ 'text-muted-foreground': !surveyLogoWidth }, { 'text-primary-foreground': !!surveyLogoWidth })}
      />
    </div>
  );
};

export default SurveysLogoSettings;
