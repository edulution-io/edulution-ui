import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';
import { license01 } from '@/assets/icons';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { Button } from '@/components/shared/Button';
import useLicenseInfoStore from '@/pages/Licensing/LicenseInfoStore';
import LicenseInfoList from '@/pages/Licensing/LicenseInfoList';

/**
 * A component that displays the overview of the licensing of the platform and allows the user to add licenses.
 */
const LicenseInfoPage = () => {
  const { t } = useTranslation();

  const { clearSelection, showOnlyActiveLicenses, setShowOnlyActiveLicenses } = useLicenseInfoStore();

  return (
    <div className="p-5 lg:pr-20">
      <NativeAppHeader
        title={t('licensing.title')}
        description={t('licensing.description')}
        iconSrc={license01}
      />
      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <LicenseInfoList />
      </div>

      <div className="absolute bottom-8 right-20 flex flex-row items-center space-x-8 bg-opacity-90">
        <Button
          type="button"
          variant="btn-outline"
          onClick={() => {
            setShowOnlyActiveLicenses(!showOnlyActiveLicenses);
            clearSelection();
          }}
          className={cn(
            { 'bg-gray-900': showOnlyActiveLicenses },
            { 'bg-gray-1000': !showOnlyActiveLicenses },
            'h-fit w-fit px-3 py-2 text-xs',
          )}
        >
          {t(
            showOnlyActiveLicenses ? 'license.info.showOnlyActiveLicensesOn' : 'license.info.showOnlyActiveLicensesOff',
          )}
        </Button>
      </div>
    </div>
  );
};

export default LicenseInfoPage;
