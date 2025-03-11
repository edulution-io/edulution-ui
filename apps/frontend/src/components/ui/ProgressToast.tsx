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

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { t } from 'i18next';

interface GenericProgressData {
  percent: number;

  title?: string;

  description?: string;

  id: string;

  failed: number;

  processed: number;

  total: number;
}

interface ProgressToasterProps {
  data?: GenericProgressData | null;

  completedDuration?: number;
}

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const progress = Math.min(Math.max(value, 0), 100);

  return (
    <div className="h-2 w-full rounded bg-gray-200">
      <div
        className="h-full rounded bg-blue-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const ProgressBox: React.FC<{ data: GenericProgressData }> = ({ data }) => {
  const { percent, title, description, failed, processed, total } = data;

  return (
    <div className="flex flex-col gap-2">
      {title && <h2 className="text-sm font-bold">{title}</h2>}

      <div className="flex items-center gap-2">
        <ProgressBar value={percent} />
        <span className="whitespace-nowrap text-sm text-background">{percent}%</span>
      </div>

      {description && <p className="text-sm text-background">{description}</p>}

      <p className="text-sm text-background">
        {t('filesharing.progressBox.processedInfo', {
          processed,
          total,
        })}
      </p>

      {failed > 0 && <p className="text-sm text-background">{t('filesharing.progressBox.errorInfo', { failed })}</p>}
    </div>
  );
};

const ProgressToaster: React.FC<ProgressToasterProps> = ({ data, completedDuration = 5000 }) => {
  useEffect(() => {
    if (data) {
      toast(<ProgressBox data={data} />, {
        id: data.id,
        duration: data.percent >= 100 ? completedDuration : Infinity,
      });
    }
  }, [data, completedDuration]);

  return null;
};

export default ProgressToaster;
