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

import React, { useEffect } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/shared/Card';
import { BadgeSH } from '@/components/ui/BadgeSH';

const LmnVersionInfo = () => {
  const { t } = useTranslation();
  const { lmnVersions, isGetVersionLoading, getLmnVersion } = useLmnApiStore();

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
                <BadgeSH className="text-p">{!version && isGetVersionLoading ? '...' : version}</BadgeSH>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default LmnVersionInfo;
