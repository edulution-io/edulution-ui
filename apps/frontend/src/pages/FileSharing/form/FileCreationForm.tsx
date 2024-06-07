import React from 'react';
import Input from '@/components/shared/Input';
import { validateFileName } from '@/pages/FileSharing/utilities/fileManagerCommon';
import { t } from 'i18next';

interface FileCreationFormProps {
  fileName: string;
  setFileName: (fileName: string) => void;
}

const FileCreationForm: React.FC<FileCreationFormProps> = ({ fileName, setFileName }) => {
  const [error, setError] = React.useState('');

  const handleValidateFileName = (name: string) => {
    const validationResult = validateFileName(name);

    if (validationResult.isValid) {
      setError('');
      setFileName(name);
    } else {
      setError(validationResult.error);
      setFileName('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    handleValidateFileName(name);
  };

  return (
    <>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Input
        variant="default"
        placeholder={t('fileCreateNewContent.fileNamePlaceholder')}
        value={fileName}
        onChange={handleInputChange}
      />
    </>
  );
};

export default FileCreationForm;
