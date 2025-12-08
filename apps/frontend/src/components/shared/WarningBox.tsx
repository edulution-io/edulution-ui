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

import React from 'react';

interface WarningBoxProps {
  title: string;
  description: string;
  filenames: string[];
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  icon?: React.ReactNode;
}

const WarningBox: React.FC<WarningBoxProps> = ({
  title,
  description,
  filenames,
  borderColor,
  backgroundColor,
  textColor,
  icon,
}: WarningBoxProps) => {
  if (!filenames.length) return null;
  return (
    <div
      className={`
        mb-4 rounded border ${borderColor} ${backgroundColor} p-3 ${textColor}
        flex flex-col items-center text-center
      `}
    >
      {icon && <div className="mb-2 flex h-6 w-6 items-center justify-start">{icon}</div>}
      <p className="font-bold">{title}</p>
      <p className="text-sm">{description}</p>
      <ul className="ml-4 w-full max-w-[24rem]  list-disc  overflow-hidden truncate ">
        {filenames.map((filename) => (
          <li key={filename}>{filename}</li>
        ))}
      </ul>
    </div>
  );
};

export default WarningBox;
