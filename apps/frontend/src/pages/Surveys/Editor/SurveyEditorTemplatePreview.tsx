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

import React, { useEffect, useRef } from 'react';
import { Serializer } from 'survey-core';
import { Model, Survey } from 'survey-react-ui';
import useLanguage from '@/hooks/useLanguage';
import THEME from '@libs/common/constants/theme';
import useThemeStore from '@/store/useThemeStore';
import surveyTheme from '@/pages/Surveys/theme/surveyTheme';
import useSurveyTemplateStore from '@/pages/Surveys/Editor/dialog/useSurveyTemplateStore';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';

const SurveyEditorTemplatePreview = (): JSX.Element | null => {
  const { template: surveyTemplateDto, setIsOpenTemplatePreview } = useSurveyTemplateStore();

  const { language } = useLanguage();

  const { getResolvedTheme } = useThemeStore();

  const currentTheme = getResolvedTheme();

  const modelRef = useRef<Model | null>(null);
  if (!modelRef.current && surveyTemplateDto?.template.formula) {
    modelRef.current = new Model(surveyTemplateDto.template.formula);
  }
  const model = modelRef.current;

  useEffect(() => {
    if (!model) return;
    model.applyTheme(surveyTheme);
    if (model.pages.length > 3) {
      model.showProgressBar = 'top';
    }
  }, [model]);

  useEffect(() => {
    if (!model) return;
    model.locale = language;
  }, [model, language]);

  useEffect(() => {
    if (!model) return;
    Serializer.getProperty('signaturepad', 'penColor').defaultValue =
      currentTheme === THEME.dark ? 'rgba(255, 255, 255, 1)' : 'rgba(17, 24, 39, 1)';
  }, [model, currentTheme]);

  if (!surveyTemplateDto || !surveyTemplateDto.template.formula || !model) {
    return null;
  }

  return (
    <ResizableWindow
      titleTranslationId="common.preview"
      handleClose={() => setIsOpenTemplatePreview(false)}
      openMaximized
    >
      <div className="survey-participation h-full w-full">
        <Survey model={model} />
      </div>
    </ResizableWindow>
  );
};

export default SurveyEditorTemplatePreview;
