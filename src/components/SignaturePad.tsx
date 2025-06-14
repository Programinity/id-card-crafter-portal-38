import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Download, Signature, Move, Crop, Plus } from 'lucide-react';
import { ImageCropDialog } from './ImageCropDialog';

interface SignaturePadProps {
  onSignatureChange: (signatureDataUrl: string) => void;
  width?: number;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  width = 400,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [showCropDialog, setShowCropDialog] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert to data URL and notify parent
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    onSignatureChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
    setSignatureDataUrl('');
    onSignatureChange('');
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setSignatureDataUrl(croppedImageUrl);
    onSignatureChange(croppedImageUrl);
    
    // Update the canvas with the cropped image
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = croppedImageUrl;
  };

  const handleInsert = () => {
    if (hasSignature && signatureDataUrl) {
      // Dispatch event with extra 'side' property
      const dragData = {
        type: 'signature',
        label: 'Signature',
        imageUrl: signatureDataUrl,
        // NOTE: Adding timestamp to ensure TemplateCanvas picks up new events even if multiple identical inserts happen
        _insertTime: Date.now(),
      };
      console.log("SignaturePad: Dispatching insertElement", dragData);
      window.dispatchEvent(new CustomEvent('insertElement', {
        detail: dragData
      }));
    }
  };

  const handleDragStart = (event: React.DragEvent) => {
    if (hasSignature && signatureDataUrl) {
      setIsDragging(true);
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'signature',
        label: 'Signature',
        imageUrl: signatureDataUrl
      }));
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-slate-800">Digital Signature</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCropDialog(true)}
            disabled={!hasSignature}
          >
            <Crop className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadSignature}
            disabled={!hasSignature}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-2">
        <div
          className={`relative ${hasSignature ? 'cursor-move' : ''} ${
            isDragging ? 'opacity-50' : ''
          }`}
          draggable={hasSignature}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <canvas
            ref={canvasRef}
            className="border border-slate-200 rounded cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          {hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all pointer-events-none">
              <Move className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
            </div>
          )}
        </div>
        
        {hasSignature && (
          <Button
            size="sm"
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleInsert}
          >
            <Plus className="w-4 h-4 mr-2" />
            Insert to Template
          </Button>
        )}
        
        <p className="text-sm text-slate-600 mt-2 text-center">
          {hasSignature 
            ? "Drag signature to template or click Insert" 
            : "Click and drag to create your signature"
          }
        </p>
      </div>

      <ImageCropDialog
        isOpen={showCropDialog}
        onClose={() => setShowCropDialog(false)}
        imageUrl={signatureDataUrl}
        onCropComplete={handleCropComplete}
      />
    </Card>
  );
};
