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

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '../ui/Textarea';

type ProgressTextAreaProps = {
  text: string[];
};

const ProgressTextArea: React.FC<ProgressTextAreaProps> = ({ text }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const progressText = text.join('\n');

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div className="flex flex-col items-center p-4">
      <Textarea
        ref={textAreaRef}
        value={progressText}
        readOnly
        placeholder={t('common.progress')}
        className="w-full overflow-y-auto whitespace-pre-wrap rounded-md border bg-foreground p-2 text-p text-background scrollbar-thin placeholder:text-p focus:outline-none"
      />
    </div>
  );
};

export default ProgressTextArea;
