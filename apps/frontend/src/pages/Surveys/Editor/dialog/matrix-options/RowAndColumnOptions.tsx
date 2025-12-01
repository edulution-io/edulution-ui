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

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdRemove } from 'react-icons/md';
import { Base, ItemValue, QuestionMatrixBaseModel } from 'survey-core';
import isQuestionTypeMatrixType from '@libs/survey/utils/isQuestionTypeMatrixType';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import getRandomUUID from '@/utils/getRandomUUID';

type TRow = Partial<Array<ItemValue | Base>> & {
  name?: string;
  value?: string;
  title?: string;
  text?: string;
  clone: () => TRow;
};

type TColumn = Partial<Array<ItemValue | Base>> & {
  name?: string;
  value?: string;
  title?: string;
  text?: string;
  clone: () => TColumn;
};

const RowAndColumnOptions = () => {
  const { t } = useTranslation();

  const { selectedQuestion, questionType: type } = useQuestionsContextMenuStore();
  if (!selectedQuestion) return null;
  if (!isQuestionTypeMatrixType(type)) return null;

  const question = selectedQuestion as QuestionMatrixBaseModel<TRow, TColumn>;

  const rows = useMemo(() => (question.rows as Array<TRow>) || [], [question.rows]);
  const columns = useMemo(() => (question.columns as Array<TColumn>) || [], [question.columns]);

  const getNewRow = () => {
    const newRow = rows[rows.length - 1].clone();
    if (newRow.value) {
      newRow.value = getRandomUUID();
      newRow.text = t('survey.editor.questionSettings.newRow');
    } else if (newRow.name) {
      newRow.name = getRandomUUID();
      newRow.title = t('survey.editor.questionSettings.newRow');
    }
    return newRow;
  };

  const getNewColumn = () => {
    const newColumn = columns[columns.length - 1].clone();
    if (newColumn.name) {
      newColumn.name = getRandomUUID();
      newColumn.title = t('survey.editor.questionSettings.newColumn');
    } else if (newColumn.value) {
      newColumn.value = getRandomUUID();
      newColumn.text = t('survey.editor.questionSettings.newColumn');
    }
    return newColumn;
  };

  const addRow = () => {
    const newRows = [...rows, getNewRow()];
    question.rows = newRows;
  };

  const removeRow = () => {
    if (rows.length <= 1) return;
    const newRows = rows;
    newRows.pop();
    question.rows = newRows;
  };

  const handleRowCountChange = (count: number) => {
    const currentCount = rows.length;
    if (count < 1) return;
    if (currentCount > count) {
      const newRows = rows.slice(0, count);
      question.rows = newRows;
    } else if (currentCount < count) {
      const newRows = Array.from({ length: count - currentCount }, () => getNewRow());
      question.rows = [...rows, ...newRows];
    }
  };

  const addColumn = () => {
    const newColumns = [...columns, getNewColumn()];
    question.columns = newColumns;
  };

  const removeColumn = () => {
    if (columns.length <= 1) return;
    const newColumns = columns;
    newColumns.pop();
    question.columns = newColumns;
  };

  const handleColumnCountChange = (count: number) => {
    const currentCount = columns.length;
    if (count < 1) return;
    if (currentCount > count) {
      const newColumns = columns.slice(0, count);
      question.columns = newColumns;
    } else if (currentCount < count) {
      const newColumns = Array.from({ length: count - currentCount }, () => getNewColumn());
      question.columns = [...columns, ...newColumns];
    }
  };

  return (
    <>
      <p className="text-m font-bold text-primary-foreground">{t('survey.editor.questionSettings.rowsAndColumns')}</p>
      <p className="text-sm text-muted-foreground">{t('survey.editor.questionSettings.rows')}</p>
      <div className="inline-flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={question.rows.length || 1}
          onChange={(e) => handleRowCountChange(Math.max(1, Number(e.currentTarget.value)))}
          variant="dialog"
          className="ml-2 max-w-[75px] flex-1 text-primary-foreground"
        />
        <Button
          onClick={() => addRow()}
          variant="btn-outline"
          size="sm"
          title={t('survey.editor.questionSettings.addRow')}
        >
          <MdAdd className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => removeRow()}
          variant="btn-outline"
          size="sm"
          title={t('survey.editor.questionSettings.removeRow')}
        >
          <MdRemove className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{t('survey.editor.questionSettings.columns')}</p>
      <div className="inline-flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={question.columns.length || 1}
          onChange={(e) => handleColumnCountChange(Math.max(1, Number(e.currentTarget.value)))}
          variant="dialog"
          className="ml-2 max-w-[75px] flex-1 text-primary-foreground"
        />
        <Button
          onClick={() => addColumn()}
          variant="btn-outline"
          size="sm"
          title={t('survey.editor.questionSettings.addColumn')}
        >
          <MdAdd className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => removeColumn()}
          variant="btn-outline"
          size="sm"
          title={t('survey.editor.questionSettings.removeColumn')}
        >
          <MdRemove className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default RowAndColumnOptions;
