import { ChangeEvent } from 'react';
import { Button } from './Button';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export const FileUpload = ({ onUpload }: FileUploadProps) => {
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button type="button" variant="outline">
          Upload Resume
        </Button>
      </label>
    </div>
  );
}; 