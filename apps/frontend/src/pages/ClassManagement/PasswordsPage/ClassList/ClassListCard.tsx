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
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import FileExportFormat from '@libs/classManagement/types/fileExportFormat';
import ClassSelectionCard from '@/pages/ClassManagement/components/ClassSelectionCard';
import PrintPasswordsDialog from '@/pages/ClassManagement/PasswordsPage/PrintPasswordsDialog';

interface ClassListCardProps {
  group: LmnApiSchoolClass;
  selectedClasses: LmnApiSchoolClass[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<LmnApiSchoolClass[]>>;
  disabled?: boolean;
}

const ClassListCard = ({ selectedClasses, setSelectedClasses, group, disabled }: ClassListCardProps) => {
  const [classToPrint, setClassToPrint] = useState<LmnApiSchoolClass | null>(null);
  const [formatToPrint, setFormatToPrint] = useState<FileExportFormat | null>(null);

  const handlePdfClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFormatToPrint(FileExportFormat.PDF);
    setClassToPrint(group);
  };

  const handleCsvClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFormatToPrint(FileExportFormat.CSV);
    setClassToPrint(group);
  };

  return (
    <>
      <ClassSelectionCard
        group={group}
        selectedClasses={selectedClasses}
        setSelectedClasses={setSelectedClasses}
        disabled={disabled}
        onPdfClick={handlePdfClick}
        onCsvClick={handleCsvClick}
      />

      {classToPrint && formatToPrint && (
        <PrintPasswordsDialog
          title={formatToPrint}
          selectedClasses={[classToPrint]}
          onClose={() => {
            setClassToPrint(null);
            setFormatToPrint(null);
          }}
        />
      )}
    </>
  );
};

export default ClassListCard;
