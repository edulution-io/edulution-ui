/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { t } from 'i18next';
import Progress from '@/components/ui/Progress';

interface ProgressBoxProps {
  percent: number;
  title?: string;
  description?: string;
  id: string;
  failed: number;
  processed: number;
  total: number;
}

const ProgressBox: React.FC<{ data: ProgressBoxProps }> = ({ data }) => {
  const { percent, title, description, failed, processed, total } = data;

  return (
    <div className="flex flex-col gap-2">
      {title && <h2 className="text-sm font-bold">{title}</h2>}

      <div className="flex items-center gap-2">
        <Progress value={percent} />
        <span className="whitespace-nowrap text-sm text-background">{percent}%</span>
      </div>

      {description && <p className="text-sm text-background">{description}</p>}

      <p className="text-sm text-background">
        {t('filesharing.progressBox.processedInfo', {
          processed: processed - failed,
          total,
        })}
      </p>
    </div>
  );
};

export default ProgressBox;
