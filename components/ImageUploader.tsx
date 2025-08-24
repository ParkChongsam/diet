
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles && rejectedFiles.length > 0) {
      setError(rejectedFiles[0].errors[0].message);
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: false,
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center transition-all duration-300 ease-in-out">
      <div
        {...getRootProps()}
        className={`p-10 border-3 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'border-brand-primary bg-brand-light' : 'border-gray-300 hover:border-brand-secondary'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
            <UploadIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
            {isDragActive ? 'Drop the image here' : 'Drag & drop a meal photo or click to select'}
            </h2>
            <p className="text-gray-500 mt-2">Supports JPEG, PNG. Max 10MB.</p>
            {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}
        </div>
      </div>
       <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6 mt-4 text-left max-w-4xl mx-auto">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="font-bold text-brand-dark">1. Upload Photo</div>
                    <p className="text-sm text-gray-600">Snap a picture of your meal and upload it.</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="font-bold text-brand-dark">2. AI Analysis</div>
                    <p className="text-sm text-gray-600">Our AI identifies each food item and estimates its calories.</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="font-bold text-brand-dark">3. Track Your Day</div>
                    <p className="text-sm text-gray-600">Confirm the items to add them to your daily total.</p>
                </div>
            </div>
        </div>
    </div>
  );
};
