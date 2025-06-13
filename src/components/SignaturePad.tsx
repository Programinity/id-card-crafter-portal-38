import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Download, Signature } from 'lucide-react';

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
            onClick={downloadSignature}
            disabled={!hasSignature}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-2">
        <canvas
          ref={canvasRef}
          className="border border-slate-200 rounded cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <p className="text-sm text-slate-600 mt-2 text-center">
          Click and drag to create your signature
        </p>
      </div>
    </Card>
  );
};
