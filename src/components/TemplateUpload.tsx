
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useIDCardStore } from '../store/useIDCardStore';

export const TemplateUpload = () => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const { setFrontTemplate, setBackTemplate, frontTemplate, backTemplate } = useIDCardStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (side === 'front') {
          setFrontTemplate(imageUrl);
        } else {
          setBackTemplate(imageUrl);
        }
        console.log(`${side} template uploaded successfully`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Front Template</label>
        <input
          ref={frontInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, 'front')}
          className="hidden"
        />
        <Button
          onClick={() => frontInputRef.current?.click()}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Front
        </Button>
        {frontTemplate && (
          <div className="mt-2 relative">
            <img
              src={frontTemplate}
              alt="Front template"
              className="w-full h-20 object-cover rounded border"
            />
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Back Template</label>
        <input
          ref={backInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, 'back')}
          className="hidden"
        />
        <Button
          onClick={() => backInputRef.current?.click()}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Back
        </Button>
        {backTemplate && (
          <div className="mt-2 relative">
            <img
              src={backTemplate}
              alt="Back template"
              className="w-full h-20 object-cover rounded border"
            />
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
