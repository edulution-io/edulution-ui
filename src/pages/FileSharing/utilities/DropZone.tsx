import React, {FC, useCallback} from "react";
import {useDropzone} from "react-dropzone";
import {XMarkIcon} from "@heroicons/react/24/solid";
import {DocumentIcon} from "@heroicons/react/16/solid";
import { MdOutlineCloudUpload } from "react-icons/md";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Button} from "@/components/shared/Button.tsx";

export interface FileWithPreview extends File {
    preview: string;
}

interface DropZoneProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
}


export const DropZone: FC<DropZoneProps> = ({ files, setFiles }) => {
    const removeFile = (name: string) => {
        setFiles((files) => files.filter((file) => file.name !== name));
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.filter(
            (file) => !files.some((f) => f.name === file.name)
        );
        if (newFiles.length ) {
            setFiles((previousFiles) => [
                ...previousFiles,
                ...acceptedFiles.map((file) => {
                    const fileWithPreview: FileWithPreview = Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    });
                    return fileWithPreview;
                }),
            ]);
        }
    }, [files]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
    const dropzoneStyle = `border-2 border-dashed border-gray-300 rounded-md p-10 ${
        isDragActive ? "bg-gray-200" : "bg-gray-100"
    }`;

    return (
        <form>
            <div {...getRootProps({className: `${dropzoneStyle}`})}>
                <input {...getInputProps()} />
                {files.length <= 5 ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-gray-700 font-semibold">
                            {isDragActive ? "Drop the files here..." : "Drag 'n' drop some files here, or click to select files"}
                        </p>
                        <MdOutlineCloudUpload className="w-12 h-12 text-gray-500"/>
                    </div>
                ) : (
                    <div>
                        <p className="text-red-700 font-bold">You can´t upload more than 5 items at a time</p>
                    </div>
                )}
            </div>

            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                {files.map((file, index) => (
                    <li key={file.name + index}
                        className="relative border rounded-md overflow-hidden shadow-lg p-2">
                        {file.type.startsWith("image/") ? (
                            <img
                                src={file.preview}
                                alt={`Preview ${index}`}
                                className="w-full h-auto object-cover mb-2"
                                onLoad={() => URL.revokeObjectURL(file.preview)}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-20">
                                <DocumentIcon className="w-8 h-8 text-gray-500"/>
                            </div>
                        )}
                        <Button onClick={() => removeFile(file.name)}
                                className="absolute top-0 right-0 p-1 bg-white bg-opacity-70 rounded-full">
                            <XMarkIcon className="w-5 h-5 text-red-500 hover:text-red-700"/>
                        </Button>
                        <div className="text-xs text-neutral-500 text-center truncate underline">{file.name}</div>
                    </li>
                ))}
            </ul>
            <p className="pt-4 underline">Files to upload:</p>
             <ScrollArea className="h-[200px]">
                <ol type="1">
                    {files.map((file, i) =>
                        <li key={i}>{`${i + 1}. ${file.name}`}</li>
                    )}
                </ol>
            </ScrollArea>
        </form>
    );
};