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

import React, { useEffect } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/shared/Card';
import { BadgeSH } from '@/components/ui/BadgeSH';

const LmnVersionInfo = () => {
  const { t } = useTranslation();
  const { lmnVersions, getLmnVersion } = useLmnApiStore();

  useEffect(() => {
    void getLmnVersion();
  }, []);

  return (
    <AccordionSH
      type="multiple"
      defaultValue={['lmnVersions']}
    >
      <AccordionItem value="lmnVersions">
        <AccordionTrigger className="text-h4">
          <h4>{t('settings.lmnVersion.title')}</h4>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(lmnVersions).map(([pkg, version]) => (
              <Card
                key={pkg}
                className="flex items-center justify-between px-3 py-2"
                variant="text"
              >
                <p className="font-bold">{pkg}</p>
                <BadgeSH className="text-p">{version}</BadgeSH>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default LmnVersionInfo;
