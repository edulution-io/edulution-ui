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
import MAX_FILE_UPLOAD_SIZE from '@libs/ui/constants/maxFileUploadSize';

const FileQuestion = () => {
  const { t } = useTranslation();

  const { maxFileSize, setMaxFileSize, allowMultiple, toggleAllowMultiple } = useQuestionsContextMenuStore();

  return (
    <div className="my-2 flex flex-col gap-2">
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.allowMultiple')}</p>
      </Label>
      <Checkbox
        label={t('survey.editor.questionSettings.addAllowMultiple')}
        checked={allowMultiple}
        onCheckedChange={() => toggleAllowMultiple()}
        className="text-background"
      />
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.maxFileSize')}</p>
      </Label>
      <Input
        type="number"
        min="0"
        max={MAX_FILE_UPLOAD_SIZE}
        placeholder={t('survey.editor.questionSettings.addMaxFileSize', { size: MAX_FILE_UPLOAD_SIZE })}
        variant="dialog"
        value={maxFileSize === 0 ? '' : maxFileSize}
        onChange={(e) => setMaxFileSize(Number(e.target.value))}
        className={cn({ 'text-muted-foreground': !maxFileSize }, { 'text-primary-foreground': maxFileSize })}
      />
    </div>
  );
};

export default FileQuestion;
