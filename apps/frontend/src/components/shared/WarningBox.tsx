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
      <ul className="ml-4 list-disc">
        {filenames.map((filename) => (
          <li key={filename}>{filename}</li>
        ))}
      </ul>
    </div>
  );
};

export default WarningBox;
