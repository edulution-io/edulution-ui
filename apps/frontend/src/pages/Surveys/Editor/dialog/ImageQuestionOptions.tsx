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

const ImageQuestionOptions = () => {
  const { t } = useTranslation();

  const { imageWidth, setImageWidth } = useQuestionsContextMenuStore();

  return (
    <div className="my-2 flex flex-col gap-2">
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.imageWidth')}</p>
      </Label>
      <Input
        placeholder={t('survey.editor.questionSettings.imageWidthPlaceholder')}
        variant="dialog"
        value={imageWidth === 0 ? '' : imageWidth}
        onChange={(e) => {
          const inputWidth = e.target.value.replace(/\D/g, '');
          setImageWidth(Number(inputWidth));
        }}
        className={cn({ 'text-muted-foreground': !imageWidth }, { 'text-primary-foreground': imageWidth })}
      />
    </div>
  );
};

export default ImageQuestionOptions;
