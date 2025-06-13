
import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Crop, Move } from 'lucide-react';

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
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragStart = (event: React.DragEvent) => {
    if (previewUrl) {
      setIsDragging(true);
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'id_picture',
        label: 'ID Picture',
        imageUrl: previewUrl
      }));
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-slate-800 mb-3">ID Picture</h3>
      
      <div className="space-y-3">
        {previewUrl ? (
          <div className="relative">
            <div
              className={`w-32 h-32 cursor-move border-2 rounded-lg overflow-hidden ${
                isDragging ? 'border-blue-500 opacity-50' : 'border-slate-200'
              }`}
              draggable={true}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <img
                src={previewUrl}
                alt="ID Picture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
                <Move className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-1" />
                Change
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Crop className="w-4 h-4 mr-1" />
                Crop
              </Button>
            </div>
            <p className="text-xs text-slate-600 mt-2 text-center">
              Drag to place on template
            </p>
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
        
        {!previewUrl && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Picture
          </Button>
        )}
      </div>
    </Card>
  );
};
