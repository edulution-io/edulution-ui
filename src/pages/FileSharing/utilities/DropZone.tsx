import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface FileWithPreview extends File {
  preview: string;
}

export const DropZone = ({ className }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const removeFile = (name: string) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <form>
      <div {...getRootProps({ className })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-black">Drop the files here...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        {files.map((file, index) => (
          <li key={file.name + index} className="relative border rounded-md overflow-hidden shadow-lg p-2">
            {file.type.startsWith("image/") ? (

              <img
                src={file.preview}
                alt={`Preview ${index}`}
                className="w-full h-auto object-cover mb-2"
                onLoad={() => URL.revokeObjectURL(file.preview)}
              />
            ) : (
              <div className="flex items-center justify-center h-20">
                <p className="text-center text-neutral-700">{file.name}</p>
              </div>
            )}
            <button onClick={() => removeFile(file.name)} className="absolute top-0 right-0 p-1 bg-white bg-opacity-70 rounded-full">
              <XMarkIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
            </button>
            <div className="text-xs text-neutral-500 text-center truncate">{file.name}</div>
          </li>
        ))}
      </ul>
    </form>
  );
};
