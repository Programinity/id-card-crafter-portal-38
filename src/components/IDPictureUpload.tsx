
import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera } from 'lucide-react';

interface IDPictureUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
}

export const IDPictureUpload: React.FC<IDPictureUploadProps> = ({
  onImageUpload,
  currentImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-slate-800 mb-3">ID Picture</h3>
      
      <div className="space-y-3">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="ID Picture"
              className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm text-slate-600 text-center">Upload ID Picture</span>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {previewUrl ? 'Change Picture' : 'Upload Picture'}
        </Button>
      </div>
    </Card>
  );
};
