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

const ImageQuestions = () => {
  const { t } = useTranslation();

    const { width, setWidth, height, setHeight, keepRatio, toggleKeepRatio } = useQuestionsContextMenuStore();

  return (
    <>
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.width')}</p>
      </Label>
      <Input
        placeholder={t('survey.editor.questionSettings.addWidth')}
        type="number"
        variant="dialog"
        value={width}
        disabled={keepRatio && !!height}
        onChange={(e) => setWidth(Math.max(Number(e.target.value), 100))}
        className={cn('mb-4', { 'text-muted-foreground': !width }, { 'text-primary-foreground': width })}
      />
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.height')}</p>
      </Label>
      <Input
        placeholder={t('survey.editor.questionSettings.addHeight')}
        type="number"
        variant="dialog"
        value={height}
        disabled={keepRatio && !!width}
        onChange={(e) => setHeight(Math.max(Number(e.target.value), 100))}
        className={cn('mb-4', { 'text-muted-foreground': !height }, { 'text-primary-foreground': height })}
      />
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.keepRatio')}</p>
      </Label>
      <Checkbox
        label={t('survey.editor.questionSettings.addKeepRatio')}
        checked={keepRatio}
        disabled={!!width && !!height}
        onCheckedChange={() => toggleKeepRatio()}
        className="text-background"
      />
    </>
  );
};

export default ImageQuestions;