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

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@edulution-io/ui-kit';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import DropZone from '@/components/ui/DropZone';
import type ListManagementEntry from '@libs/userManagement/types/listManagementEntry';
import { deviceEntriesToCsv, csvToDeviceEntries } from '@libs/deviceManagement/utils/deviceCsvUtils';

interface DeviceCsvDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: string;
  entries: ListManagementEntry[];
  onSave: (entries: ListManagementEntry[]) => void;
}

const DeviceCsvDialog: React.FC<DeviceCsvDialogProps> = ({ isOpen, onClose, school, entries, onSave }) => {
  const { t } = useTranslation();
  const [csvText, setCsvText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCsvText(deviceEntriesToCsv(entries));
    }
  }, [isOpen, entries]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleSave = () => {
    onSave(csvToDeviceEntries(csvText));
    onClose();
  };

  const handleDownload = () => {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'devices.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const lineCount = csvText.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const body = (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-[60vh] min-h-[200px] overflow-hidden rounded-md border">
        <div
          ref={lineNumbersRef}
          className="select-none overflow-hidden bg-ciDarkGrey px-2 py-2 text-right font-mono text-sm leading-6 text-muted-foreground"
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          onScroll={handleScroll}
          className="flex-1 resize-none bg-ciDarkGrey p-2 font-mono text-sm leading-6 text-white focus:outline-none"
          spellCheck={false}
        />
      </div>
      <DropZone
        onDrop={handleFileDrop}
        accept={{ 'text/csv': ['.csv'], 'text/plain': ['.txt'] }}
      />
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-4">
      <Button
        variant="btn-outline"
        size="lg"
        onClick={handleDownload}
      >
        {t('deviceManagement.csv.download')}
      </Button>
      <DialogFooterButtons
        handleClose={onClose}
        handleSubmit={handleSave}
      />
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={`/etc/linuxmuster/sophomorix/${school}/devices.csv`}
      body={body}
      footer={footer}
      desktopContentClassName="max-w-4xl"
    />
  );
};

export default DeviceCsvDialog;
