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

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM, { Root } from 'react-dom/client';
import { SurveyModel } from 'survey-core';
import { VisualizationPanel } from 'survey-analytics';
import 'survey-analytics/survey.analytics.min.css';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import useLanguage from '@/hooks/useLanguage';
import '../dialogs/resultVisualizationDialog.css';
import SelectDropdown, { SelectOption } from './SelectDropdown';

const visuPanelOptions = {
  haveCommercialLicense: true,
  defaultChartType: 'bar',
  showToolbar: false,
  allowDynamicLayout: true,
  allowHideQuestions: false,
};

interface ResultVisualizationDialogBodyProps {
  formula?: SurveyFormula;
  result?: JSON[];
}

const ResultVisualization = (props: ResultVisualizationDialogBodyProps) => {
  const { formula, result } = props;

  const { language } = useLanguage();

  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [visuPanel, setVisuPanel] = useState<VisualizationPanel | null>(null);
  const rootsRef = useRef<Map<HTMLSelectElement, Root>>(new Map());

  const mountDropdownOnSelect = (nativeSelect: HTMLSelectElement) => {
    const el = nativeSelect;
    if (el.dataset.replaced) return;
    el.dataset.replaced = 'true';
    el.style.display = 'none';

    const options: SelectOption[] = Array.from(el.options).map((o) => ({
      id: o.value,
      name: o.text,
    }));

    const wrapper = document.createElement('div');
    el.insertAdjacentElement('afterend', wrapper);

    const root = ReactDOM.createRoot(wrapper);
    root.render(
      <SelectDropdown
        options={options}
        initialValue={el.value}
        onSelect={(val: string) => {
          el.value = val;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }}
      />,
    );
    rootsRef.current.set(el, root);
  };

  const replaceAllSelects = (container: HTMLElement) => {
    container.querySelectorAll<HTMLSelectElement>('select').forEach(mountDropdownOnSelect);
  };

  if (survey == null) {
    const surveyModel = new SurveyModel(formula);
    setSurvey(surveyModel);
  }

  if (visuPanel == null && survey != null) {
    const questions = survey.getAllQuestions() || [];
    const answers = result || [];
    const visualizationPanel = new VisualizationPanel(questions, answers, visuPanelOptions);
    visualizationPanel.locale = language;
    visualizationPanel.showToolbar = false;
    setVisuPanel(visualizationPanel);
  }

  useEffect(() => {
    visuPanel?.render('surveyVisuPanel');

    const container = document.getElementById('surveyVisuPanel');
    if (!container) return undefined;

    setTimeout(() => replaceAllSelects(container), 0);

    const observer = new MutationObserver(() => replaceAllSelects(container));
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      rootsRef.current.forEach((root) => root.unmount());
      rootsRef.current.clear();
      container.innerHTML = '';
    };
  }, [visuPanel]);

  return (
    <div className="result-visualization rounded">
      <div id="surveyVisuPanel" />
    </div>
  );
};

export default ResultVisualization;
