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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { faPlus, faSave, faCheck, faFileCsv, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import type ListManagementEntry from '@libs/userManagement/types/listManagementEntry';
import { deviceEntriesToRows, createEmptyDeviceEntry } from '@libs/deviceManagement/utils/deviceCsvUtils';
import { validateDeviceRows, findDuplicates } from '@libs/deviceManagement/utils/deviceValidation';
import useDeviceManagementStore from '../useDeviceManagementStore';
import DeviceCsvDialog from './DeviceCsvDialog';

interface DeviceFloatingButtonsProps {
  school: string;
}

const DeviceFloatingButtons: React.FC<DeviceFloatingButtonsProps> = ({ school }) => {
  const { t } = useTranslation();
  const { isSaving, isApplying, saveDevices, applyDevices, fetchDevices, setDeviceEntries } =
    useDeviceManagementStore();
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [isApplyConfirmOpen, setIsApplyConfirmOpen] = useState(false);

  const getFilteredEntries = (): ListManagementEntry[] => {
    const { devices, deletedIndices } = useDeviceManagementStore.getState();
    const deletedSet = new Set(deletedIndices);
    return devices.filter((_, i) => !deletedSet.has(i));
  };

  const validateEntries = (): boolean => {
    const filtered = getFilteredEntries();
    const rows = deviceEntriesToRows(filtered);
    if (!validateDeviceRows(rows, new Set<string>())) {
      toast.error(t('deviceManagement.validationFailed'));
      return false;
    }
    const duplicates = findDuplicates(rows, new Set<string>());
    if (duplicates.size > 0) {
      toast.error(t('deviceManagement.validationFailed'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (school && validateEntries()) {
      await saveDevices(school, getFilteredEntries());
    }
  };

  const handleApplyClick = () => {
    if (!validateEntries()) return;
    setIsApplyConfirmOpen(true);
  };

  const handleConfirmApply = async () => {
    setIsApplyConfirmOpen(false);
    await applyDevices(school, getFilteredEntries());
    await fetchDevices(school, true);
  };

  const handleRevert = async () => {
    if (school) {
      await fetchDevices(school, true);
    }
  };

  const handleAddDevice = () => {
    const currentEntries = useDeviceManagementStore.getState().devices;
    setDeviceEntries([...currentEntries, createEmptyDeviceEntry()]);
  };

  const handleCsvSave = (entries: ListManagementEntry[]) => {
    setDeviceEntries(entries);
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: faPlus,
        text: t('deviceManagement.addDevice'),
        onClick: handleAddDevice,
        isVisible: true,
      },
      {
        icon: faRotateLeft,
        text: t('common.revert'),
        onClick: () => {
          void handleRevert();
        },
        isVisible: !isSaving,
      },
      {
        icon: faSave,
        text: t('common.save'),
        onClick: () => {
          void handleSave();
        },
        isVisible: !isSaving,
      },
      {
        icon: faCheck,
        text: t('deviceManagement.apply'),
        onClick: handleApplyClick,
        isVisible: !isSaving && !isApplying,
      },
      {
        icon: faFileCsv,
        text: t('deviceManagement.csv.title'),
        onClick: () => setIsCsvDialogOpen(true),
        isVisible: true,
      },
    ],
    keyPrefix: 'device-management-floating-button_',
  };

  return (
    <>
      <FloatingButtonsBar config={config} />
      {school ? (
        <DeviceCsvDialog
          isOpen={isCsvDialogOpen}
          onClose={() => setIsCsvDialogOpen(false)}
          school={school}
          entries={getFilteredEntries()}
          onSave={handleCsvSave}
        />
      ) : null}
      <AdaptiveDialog
        isOpen={isApplyConfirmOpen}
        handleOpenChange={() => setIsApplyConfirmOpen(false)}
        title={t('deviceManagement.applyConfirmTitle')}
        body={<p>{t('deviceManagement.applyConfirmMessage')}</p>}
        footer={
          <DialogFooterButtons
            handleClose={() => setIsApplyConfirmOpen(false)}
            handleSubmit={() => {
              void handleConfirmApply();
            }}
            submitButtonText="deviceManagement.apply"
          />
        }
      />
    </>
  );
};

export default DeviceFloatingButtons;
