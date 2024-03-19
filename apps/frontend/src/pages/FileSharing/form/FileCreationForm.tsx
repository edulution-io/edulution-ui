import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import useFileManagerStore from '@/store/fileManagerStore';
import { validateFileName } from '@/utils/common';

const FileCreationForm = () => {
  const [localFileName, setLocalFileName] = useState('');
  const setFileName = useFileManagerStore((state) => state.setFileName);
  const [error, setError] = useState('');

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
    setLocalFileName(name);
  };

  return (
    <>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Input
        placeholder="ExampleName.txt"
        value={localFileName}
        onChange={handleInputChange}
      />
    </>
  );
};
export default FileCreationForm;
