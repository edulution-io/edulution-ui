import React from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import cn from '@/lib/utils';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import { licenseKeyActive01, licenseKeyInactive01 } from '@/assets/icons';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import useLicenseInfoStore from '@/pages/Licensing/LicenseInfoStore';
import Checkbox from '@/components/ui/Checkbox';
import { TableCell } from '@/components/ui/Table';

const hideOnMobileClassName = 'hidden lg:flex';

const LicenseInfoTableColumns: ColumnDef<LicenseInfoDto>[] = [
  {
    id: 'license-checkbox',
    header: ({ table, column }) => (
      <SortableHeader<LicenseInfoDto, unknown>
        titleTranslationId=""
        table={table}
        column={column}
        className={cn('min-w-[20px] max-w-[20px]', hideOnMobileClassName)}
      />
    ),
    cell: ({ row }) => {
      const { t } = useTranslation();
      return (
        <TableCell>
          <Checkbox
            checked={row.getIsSelected()}
            aria-label={`${t('common.selected')}`}
          />
        </TableCell>
      );
    },
  },
  {
    id: 'license-id',
    header: ({ column }) => (
      <SortableHeader<LicenseInfoDto, unknown>
        titleTranslationId="license.info.id"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { setSelectedLicense } = useLicenseInfoStore();
      return (
        <SelectableTextCell
          onClick={() => {
            setSelectedLicense(row.original);
          }}
          text={`${row.original.id}`}
        />
      );
    },
  },
  {
    id: 'license-validFromUtc',
    header: ({ column }) => (
      <SortableHeader<LicenseInfoDto, unknown>
        className={hideOnMobileClassName}
        titleTranslationId="license.info.validFromUtc"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { setSelectedLicense } = useLicenseInfoStore();
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={() => {
            setSelectedLicense(row.original);
          }}
          text={`${row.original.validFromUtc}`}
        />
      );
    },
  },
  {
    id: 'license-validToUtc',
    header: ({ column }) => (
      <SortableHeader<LicenseInfoDto, unknown>
        className={hideOnMobileClassName}
        titleTranslationId="license.info.validToUtc"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { setSelectedLicense } = useLicenseInfoStore();
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={() => {
            setSelectedLicense(row.original);
          }}
          text={`${row.original.validToUtc}`}
        />
      );
    },
  },
  {
    id: 'license-isActive',
    header: ({ column }) => (
      <SortableHeader<LicenseInfoDto, unknown>
        className={hideOnMobileClassName}
        titleTranslationId="license.info.isLicenseActive"
        column={column}
      />
    ),
    cell: ({ row }) => {
      const { setSelectedLicense } = useLicenseInfoStore();
      const { t } = useTranslation();
      return (
        <SelectableTextCell
          className={hideOnMobileClassName}
          onClick={() => {
            setSelectedLicense(row.original);
          }}
          text={t(row.original.isLicenseActive ? 'common.active' : 'common.inactive')}
          icon={
            row.original.isLicenseActive ? (
              <img
                src={licenseKeyActive01}
                alt="license-active-key-icon"
                className="mx-auto w-[35px]"
              />
            ) : (
              <img
                src={licenseKeyInactive01}
                alt="license-inactive-key-icon"
                className="mx-auto w-[35px]"
              />
            )
          }
        />
      );
    },
  },
];

export default LicenseInfoTableColumns;
