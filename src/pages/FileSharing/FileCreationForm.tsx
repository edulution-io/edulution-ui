import React, {useState} from 'react';
import {Input} from "@/components/ui/input.tsx";
import {useFileManagerStore} from "@/store/appDataStore.ts";

export const FileCreationForm = () => {
    const [localFileName, setLocalFileName] = useState('');
    const setFileName= useFileManagerStore((state) => state.setFileName);
    const [error, setError] = useState('');

    const validateFileName = (name: string) => {
        if (/\s/.test(name)) {
            setError('File name should not contain spaces.');
            setFileName('');
        } else if (!name.endsWith('.txt')) {
            setError('File name must end with .txt');
            setFileName('');
        } else {
            setError('');
            setFileName(name);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.value;
        validateFileName(name);
        setLocalFileName(name)
    };

    return (
        <div>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <Input
                placeholder="ExampleName.txt"
                value={localFileName}
                onChange={handleInputChange}
            />
        </div>
    )
}
