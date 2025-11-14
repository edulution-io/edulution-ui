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
import { useTranslation } from 'react-i18next';
import useCommunityLicenseStore from '@/pages/UserSettings/Info/useCommunityLicenseStore';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { Button } from '@/components/shared/Button';
import type LicenseInfoDto from '@libs/license/types/license-info.dto';
import LicenseField from './LicenseField';
import RegisterLicenseDialog from './RegisterLicenseDialog';

const LicenseOverview: React.FC = () => {
  const { t } = useTranslation();
  const { licenseInfo, isRegisterDialogOpen, setIsRegisterDialogOpen } = useCommunityLicenseStore();

  const getFields = (license: LicenseInfoDto) => [
    { label: t('settings.license.customerId'), value: license.customerId },
    { label: t('settings.license.licenseId'), value: license.licenseId },
    { label: t('settings.license.numberOfUsers'), value: license.numberOfUsers },
    {
      label: t('settings.license.validFromUtc'),
      value: new Date(license.validFromUtc).toLocaleDateString(),
    },
    {
      label: t('settings.license.validToUtc'),
      value: new Date(license.validToUtc).toLocaleDateString(),
    },
    {
      label: t('settings.license.licenseStatus'),
      value: license.isLicenseActive ? 'Aktiv' : 'Inaktiv',
      valueClassName: license?.isLicenseActive ? 'text-ciLightGreen' : 'text-ciRed',
    },
  ];

  const handleOpenRegisterLicenseDialog = () => {
    setIsRegisterDialogOpen(!isRegisterDialogOpen);
  };

  return (
    <>
      <AccordionSH
        type="multiple"
        defaultValue={['license']}
      >
        <AccordionItem value="license">
          <AccordionTrigger>
            <h3>{t('settings.license.title')}</h3>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            {licenseInfo && licenseInfo.customerId ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {getFields(licenseInfo).map((field) => (
                  <LicenseField
                    key={field.label}
                    label={field.label}
                    value={field.value}
                    valueClassName={field.valueClassName}
                  />
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">{t('settings.license.noLicenseRegistered')}</div>
            )}
            <div className="mt-4 flex justify-end gap-4 pr-3.5">
              <Button
                variant="btn-security"
                size="lg"
                onClick={handleOpenRegisterLicenseDialog}
              >
                {t('settings.license.register')}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </AccordionSH>
      <RegisterLicenseDialog />
    </>
  );
};

export default LicenseOverview;
