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

import React, { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdRemove } from 'react-icons/md';
import { Base, ItemValue, QuestionMatrixBaseModel } from 'survey-core';
import isQuestionTypeMatrixType from '@libs/survey/utils/isQuestionTypeMatrixType';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';

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
      newRow.value = uuidv4();
      newRow.text = t('survey.editor.questionSettings.newRow');
    } else if (newRow.name) {
      newRow.name = uuidv4();
      newRow.title = t('survey.editor.questionSettings.newRow');
    }
    return newRow;
  };

  const getNewColumn = () => {
    const newColumn = columns[columns.length - 1].clone();
    if (newColumn.name) {
      newColumn.name = uuidv4();
      newColumn.title = t('survey.editor.questionSettings.newColumn');
    } else if (newColumn.value) {
      newColumn.value = uuidv4();
      newColumn.text = t('survey.editor.questionSettings.newColumn');
    }
    return newColumn;
  };

  const addRow = () => {
    const newRows = [...rows, getNewRow()];
    question.rows = newRows;
  };

  const removeRow = () => {
    const newRows = rows;
    newRows.pop();
    question.rows = newRows;
  };

  const handleRowCountChange = (count: number) => {
    const currentCount = rows.length;
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
    const newColumns = columns;
    newColumns.pop();
    question.columns = newColumns;
  };

  const handleColumnCountChange = (count: number) => {
    const currentCount = columns.length;
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
          value={question.rows.length || 0}
          onChange={(e) => handleRowCountChange(Number(e.currentTarget.value))}
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
          value={question.columns.length || 0}
          onChange={(e) => handleColumnCountChange(Number(e.currentTarget.value))}
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
