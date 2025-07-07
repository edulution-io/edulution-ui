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

import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Label from '@/components/ui/Label';
import Input from '@/components/shared/Input';
import Checkbox from '@/components/ui/Checkbox';

const FileQuestion = () => {
  const { t } = useTranslation();

  const { maxFileSize, setMaxFileSize, allowMultiple, toggleAllowMultiple } = useQuestionsContextMenuStore();

  return (
    <div className="my-2 flex flex-col gap-2">
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.maxFileSize')}</p>
      </Label>
      <Input
        type="number"
        min="0"
        placeholder={t('survey.editor.questionSettings.addMaxFileSize')}
        variant="dialog"
        value={maxFileSize || 0}
        onChange={(e) => setMaxFileSize(Math.max(Number(e.target.value), 0) * 1024 * 1024)}
        className={cn({ 'text-muted-foreground': !maxFileSize }, { 'text-primary-foreground': maxFileSize })}
      />
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.allowMultiple')}</p>
      </Label>
      <Checkbox
        label={t('survey.editor.questionSettings.addAllowMultiple')}
        checked={allowMultiple}
        onCheckedChange={() => toggleAllowMultiple()}
        className="text-background"
      />
    </div>
  );
};

export default FileQuestion;
