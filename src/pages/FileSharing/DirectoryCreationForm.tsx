import React, {useState} from 'react';
import {Input} from "@/components/ui/input.tsx";
import {useFileManagerStore} from "@/store/appDataStore.ts";

export const DirectoryCreationForm = () => {
    const [localDirectoryName, setLocalDirectoryName] = useState('');
    const setDirectoryName= useFileManagerStore((state) => state.setDirectoryName);
    const [error, setError] = useState('');

    const validateDirectoryName = (name: string) => {

        if (/\s/.test(name)) {
            setError('Directroy name should not contain spaces.');
            setDirectoryName('');
        } else if (name.includes(".")) {
            setError('Directroy is not allowed to have a file extension');

            setDirectoryName('');
        } else {
            setError('');
            console.log(name)
            setDirectoryName(name);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.value;
        setLocalDirectoryName(name)
        validateDirectoryName(name);
    };

    return (
        <div>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <Input
                placeholder="ExampleName.txt"
                value={localDirectoryName}
                onChange={handleInputChange}
            />
        </div>
    )
}
