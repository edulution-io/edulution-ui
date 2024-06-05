import React, { useState } from 'react';
import { MdGroups, MdPrint } from 'react-icons/md';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore';
import { Button } from '@/components/shared/Button';
import { transformClasses } from '@/pages/SchoolmanagementPage/utilis/utilitys';
import { t } from 'i18next';
import { translateKey } from '@/utils/common';
import FloatingActionButton from '@/components/ui/FloatingActionButton.tsx';
import { BsFiletypeCsv, BsFiletypePdf, BsFiletypeTxt } from 'react-icons/bs';

const PasswordsPage: React.FC = () => {
  const { fetchInitialPasswords, schoolclasses } = useSchoolManagementStore();
  const transformedClasses = transformClasses(schoolclasses);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const handleCheckboxChange = (className: string) => {
    setSelectedClasses((prevSelected) =>
      prevSelected.includes(className)
        ? prevSelected.filter((name) => name !== className)
        : [...prevSelected, className],
    );
  };

  const handleOnShowPasswordClicked = async (className: string) => {
    try {
      const initialPasswords = await fetchInitialPasswords(className);

      const content = initialPasswords
        .map(
          (user) =>
            `Username: ${user.username}, Initial Password: ${user.firstPassword}, Password Still Set: ${user.firstPasswordStillSet}`,
        )
        .join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${className}-initial-passwords.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error fetching initial passwords:', error);
    }
  };

  const handleDownloadAllSelected = async () => {
    if (selectedClasses.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Please select at least one class.');
      return;
    }

    try {
      const allPasswords = await Promise.all(
        selectedClasses.map(async (className) => {
          const initialPasswords = await fetchInitialPasswords(className);
          return initialPasswords
            .map(
              (user) =>
                `Class: ${className}, Username: ${user.username}, Initial Password: ${user.firstPassword}, Password Still Set: ${user.firstPasswordStillSet}`,
            )
            .join('\n');
        }),
      );

      const content = allPasswords.join('\n\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `initial-passwords.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error fetching initial passwords:', error);
    }
  };

  return (
    <div className="rounded bg-transparent p-4 shadow">
      <div className="mb-4 rounded bg-blue-100 p-4">
        <p className="text-blue-800">{t('schoolManagement.initialPasswordHint')}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(transformedClasses).map(([className]) => (
          <div
            key={className}
            className="flex items-center justify-between rounded border p-2"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                value={className}
                checked={selectedClasses.includes(className)}
                onChange={() => handleCheckboxChange(className)}
                className="mr-2"
              />
              <MdGroups className="mr-2 text-gray-600" />
              <span>{className}</span>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleOnShowPasswordClicked(className).catch(console.error);
              }}
              className="text-gray-600 hover:text-black"
            >
              <MdPrint className="text-xl text-white" />
            </Button>
          </div>
        ))}
      </div>

      {selectedClasses.length > 0 && (
        <div className="fixed bottom-8 flex flex-row space-x-8 bg-opacity-90">
          <FloatingActionButton
            icon={BsFiletypeTxt}
            text={translateKey('schoolManagement.downloadInitPasswordAsText')}
            onClick={handleDownloadAllSelected}
          />
          <FloatingActionButton
            icon={BsFiletypeCsv}
            text={translateKey('schoolManagement.downloadInitPasswordAsCSV')}
            onClick={handleDownloadAllSelected}
          />
          <FloatingActionButton
            icon={BsFiletypePdf}
            text={translateKey('schoolManagement.downloadInitPasswordAsPDF')}
            onClick={handleDownloadAllSelected}
          />
        </div>
      )}
    </div>
  );
};

export default PasswordsPage;
