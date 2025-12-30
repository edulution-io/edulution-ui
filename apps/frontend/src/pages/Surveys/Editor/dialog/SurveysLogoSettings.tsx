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
import { SurveyCreatorModel } from 'survey-creator-core';
import DropdownSelect from '@/components/ui/DropdownSelect/DropdownSelect';
import Label from '@/components/ui/Label';
import Input from '@/components/shared/Input';

interface SurveysLogoSettingsProps {
  surveyCreator: SurveyCreatorModel;
}

const SurveysLogoSettings = ({ surveyCreator }: SurveysLogoSettingsProps) => {
  const { t } = useTranslation();

  const [logoWidth, setLogoWidth] = React.useState<number>(surveyCreator.survey.renderedLogoWidth);
  const [logoPosition, setLogoPosition] = React.useState<string>(surveyCreator.survey.logoPosition ?? 'left');

  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    surveyCreator.survey.logoWidth = logoWidth !== 0 ? `${logoWidth}px` : 'auto';
  }, [logoWidth, surveyCreator]);

  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    surveyCreator.survey.logoPosition = logoPosition;
  }, [logoPosition, surveyCreator]);

  return (
    <div className="my-2 flex flex-col gap-2">
      <Label>
        <p className="font-bold">{t('survey.editor.surveySettings.surveyLogo.width.label')}</p>
      </Label>
      <Input
        type="number"
        placeholder={t('survey.editor.surveySettings.surveyLogo.width.placeholder')}
        variant="dialog"
        value={logoWidth === 0 ? '' : logoWidth}
        onChange={(e) => {
          setLogoWidth(Number(e.target.value) || 0);
        }}
      />
      <Label>
        <p className="font-bold">{t('survey.editor.surveySettings.surveyLogo.position.label')}</p>
      </Label>
      <DropdownSelect
        placeholder={t('survey.editor.surveySettings.surveyLogo.position.placeholder')}
        options={[
          { id: 'left', name: t('survey.editor.surveySettings.surveyLogo.position.left') },
          { id: 'right', name: t('survey.editor.surveySettings.surveyLogo.position.right') },
        ]}
        selectedVal={surveyCreator.survey.logoPosition ?? 'left'}
        handleChange={(value) => {
          setLogoPosition(value as 'left' | 'right');
        }}
        variant="dialog"
      />
      <p className="text-sm text-muted-foreground">
        {t('survey.editor.surveySettings.surveyLogo.position.description')}
      </p>
    </div>
  );
};

export default SurveysLogoSettings;
