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
    <div className="flex flex-col items-center py-4">
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
