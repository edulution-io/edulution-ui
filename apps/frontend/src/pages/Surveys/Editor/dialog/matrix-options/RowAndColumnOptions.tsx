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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { MatrixDropdownColumn } from 'survey-core';
import { MdAdd, MdRemove } from 'react-icons/md';
import isQuestionTypeMatrixType from '@libs/survey/utils/isQuestionTypeMatrixType';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';

const RowAndColumnOptions = () => {
  const { t } = useTranslation();

  const { selectedQuestion: question, questionType: type } = useQuestionsContextMenuStore();

  const newRow =
    type === 'matrixdropdown'
      ? {
          value: uuidv4(),
          text: t('survey.editor.questionSettings.newRow'),
        }
      : {
          value: uuidv4(),
          text: t('survey.editor.questionSettings.newRow'),
        };

  const newColumn =
    type === 'matrixdropdown'
      ? new MatrixDropdownColumn(uuidv4(), t('survey.editor.questionSettings.newColumn'))
      : {
          value: uuidv4(),
          text: t('survey.editor.questionSettings.newColumn'),
          cellType: 'text',
        };

  const addRow = () => {
    if (!question) return;
    const newRows = [...question.rows, newRow];
    question.rows = newRows;
  };
  const removeRow = () => {
    if (!question) return;
    const newRows = question.rows;
    newRows.pop();
    question.rows = newRows;
  };
  const handleRowCountChange = (count: number) => {
    if (!question) return;
    const currentCount = question.rows.length;
    if (currentCount > count) {
      const newRows = question.rows.slice(0, count);
      question.rows = newRows;
    } else if (currentCount < count) {
      const newRows = Array.from({ length: count - currentCount }, () => newRow);
      question.rows = [...question.rows, ...newRows];
    }
  };

  const addColumn = () => {
    if (!question) return;
    const newColumns = [...question.columns, newColumn];
    question.columns = newColumns;
  };
  const removeColumn = () => {
    if (!question) return;
    const newColumns = question.columns;
    newColumns.pop();
    question.columns = newColumns;
  };
  const handleColumnCountChange = (count: number) => {
    if (!question) return;
    const currentCount = question.columns.length;
    if (currentCount > count) {
      const newColumns = question.columns.slice(0, count);
      question.columns = newColumns;
    } else if (currentCount < count) {
      const newColumns = Array.from({ length: count - currentCount }, () => newColumn);
      question.columns = [...question.columns, ...newColumns];
    }
  };

  if (!isQuestionTypeMatrixType(type)) return null;

  return (
    <>
      <p className="text-m font-bold text-primary-foreground">{t('survey.editor.questionSettings.rowsAndColumns')}</p>
      <p className="text-sm text-muted-foreground">{t('survey.editor.questionSettings.rows')}</p>
      <div className="inline-flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={question?.rows.length || 0}
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
          <MdRemove className="h-6 min-h-6 w-6 min-w-6" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{t('survey.editor.questionSettings.columns')}</p>
      <div className="inline-flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={question?.columns.length || 0}
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
          <MdRemove className="h-6 min-h-6 w-6 min-w-6" />
        </Button>
      </div>
    </>
  );
};

export default RowAndColumnOptions;
