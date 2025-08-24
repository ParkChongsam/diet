
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
            {isDragActive ? '여기에 이미지를 놓으세요' : '식사 사진을 드래그하거나 클릭해서 선택하세요'}
            </h2>
            <p className="text-gray-500 mt-2">JPEG, PNG 형식 지원. 최대 10MB.</p>
            {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}
        </div>
      </div>
       <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800">작동 방식</h3>
            <div className="grid md:grid-cols-3 gap-6 mt-4 text-left max-w-4xl mx-auto">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="font-bold text-brand-dark">1. 사진 업로드</div>
                    <p className="text-sm text-gray-600">식사 사진을 찍어 업로드하세요.</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="font-bold text-brand-dark">2. AI 분석</div>
                    <p className="text-sm text-gray-600">AI가 각 음식 항목을 식별하고 칼로리를 추정합니다.</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="font-bold text-brand-dark">3. 하루 기록</div>
                    <p className="text-sm text-gray-600">항목을 확인하여 일일 섭취량에 추가하세요.</p>
                </div>
            </div>
        </div>
    </div>
  );
};