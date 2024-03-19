import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import useFileManagerStore  from '@/store/fileManagerStore';
import { validateDirectoryName } from '@/utils/common';

const DirectoryCreationForm = () => {
  const [localDirectoryName, setLocalDirectoryName] = useState('');
  const setDirectoryName = useFileManagerStore((state) => state.setDirectoryName);
  const [error, setError] = useState('');

  const handleValidateDirectoryName = (name: string) => {
    const validationResult = validateDirectoryName(name);

    if (validationResult.isValid) {
      setError('');
      setDirectoryName(name);
    } else {
      setError(validationResult.error);
      setDirectoryName('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setLocalDirectoryName(name);
    handleValidateDirectoryName(name);
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Input
        placeholder="ExampleName.txt"
        value={localDirectoryName}
        onChange={handleInputChange}
      />
    </div>
  );
};
export default DirectoryCreationForm;
