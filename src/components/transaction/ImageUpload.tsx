'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImagesSelect: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  previews: string[];
  maxFiles?: number;
}

export function ImageUpload({ onImagesSelect, onImageRemove, previews, maxFiles = 10 }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please upload image files');
      return;
    }

    // Check total count
    const totalFiles = previews.length + imageFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - previews.length} more.`);
      return;
    }

    // Pass files to parent
    onImagesSelect(imageFiles);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Payslip Image (Optional)</label>
      
      {previews.length === 0 ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-accent bg-accent/5' : 'border-border'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-accent/10 p-3">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drop payment slips here or{' '}
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="text-accent hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload up to {maxFiles} images (JPG, PNG - Max 5MB each)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative rounded-lg border border-border overflow-hidden group">
              <img
                src={preview}
                alt={`Slip ${index + 1}`}
                className="w-full h-32 object-cover bg-muted"
              />
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-danger text-white hover:bg-danger/90 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-xs text-white">
                #{index + 1}
              </div>
            </div>
          ))}
          
          {previews.length < maxFiles && (
            <button
              type="button"
              onClick={onButtonClick}
              className="h-32 rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-accent"
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs">Add more</span>
            </button>
          )}
        </div>
      )}
      
      {previews.length > 0 && (
        <p className="text-xs text-muted-foreground">
          📎 {previews.length} of {maxFiles} slips uploaded • Each slip will be processed separately
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        💡 Upload multiple payment slips for batch processing (Thai & English supported)
      </p>
    </div>
  );
}
