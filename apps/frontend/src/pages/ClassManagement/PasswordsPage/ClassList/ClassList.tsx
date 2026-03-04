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
import GroupColumn from '@libs/groups/types/groupColumn';
import FileExportFormat from '@libs/classManagement/types/fileExportFormat';
import ClassSelectionList from '@/pages/ClassManagement/components/ClassSelectionList';
import PasswordsFloatingButtonsBar from '@/pages/ClassManagement/PasswordsPage/PasswordsFloatingButtonsBar';
import PrintPasswordsDialog from '@/pages/ClassManagement/PasswordsPage/PrintPasswordsDialog';

interface ClassListProps {
  row: Omit<GroupColumn, 'icon'>;
  selectedClasses: LmnApiSchoolClass[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<LmnApiSchoolClass[]>>;
  activeSchool: string | null;
}

const ClassList = ({ row, selectedClasses, setSelectedClasses, activeSchool }: ClassListProps) => {
  const [classToPrint, setClassToPrint] = useState<LmnApiSchoolClass | null>(null);
  const [formatToPrint, setFormatToPrint] = useState<FileExportFormat | null>(null);

  const handlePdfClick = (group: LmnApiSchoolClass) => {
    setFormatToPrint(FileExportFormat.PDF);
    setClassToPrint(group);
  };

  const handleCsvClick = (group: LmnApiSchoolClass) => {
    setFormatToPrint(FileExportFormat.CSV);
    setClassToPrint(group);
  };

  return (
    <>
      <ClassSelectionList
        row={row}
        selectedClasses={selectedClasses}
        setSelectedClasses={setSelectedClasses}
        activeSchool={activeSchool}
        floatingBar={<PasswordsFloatingButtonsBar selectedClasses={selectedClasses} />}
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

export default ClassList;
