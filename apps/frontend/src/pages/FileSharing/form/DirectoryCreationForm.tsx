import React from 'react';
import Input from '@/components/shared/Input';
import { validateDirectoryName } from '@/pages/FileSharing/utilities/fileManagerCommon';

interface DirectoryCreationFormProps {
  directoryName: string;
  setDirectoryName: (name: string) => void;
}

const DirectoryCreationForm: React.FC<DirectoryCreationFormProps> = ({ directoryName, setDirectoryName }) => {
  const [error, setError] = React.useState('');

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
    setDirectoryName(name);
    handleValidateDirectoryName(name);
  };

  return (
    <>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Input
        variant="default"
        placeholder="NewDirectory"
        value={directoryName}
        onChange={handleInputChange}
      />
    </>
  );
};

export default DirectoryCreationForm;
