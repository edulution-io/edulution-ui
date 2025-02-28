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
          <AccordionTrigger className="flex text-h4">
            <h4>{t('settings.license.title')}</h4>
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
