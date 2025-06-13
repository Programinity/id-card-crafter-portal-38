
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crop, RotateCw, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isOpen && imageUrl) {
      setImageLoaded(false);
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        // Reset crop area when new image loads
        setCropArea({ x: 50, y: 50, width: 200, height: 200 });
        setScale(1);
      };
      img.src = imageUrl;
      if (imageRef.current) {
        imageRef.current.src = imageUrl;
      }
    }
  }, [isOpen, imageUrl]);

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
    e.preventDefault();
    if (type === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
    }
    setDragStart({ x: e.clientX, y: e.clientY });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStart.x;
      const deltaY = moveEvent.clientY - dragStart.y;

      if (type === 'drag' && isDragging) {
        setCropArea(prev => ({
          ...prev,
          x: Math.max(0, Math.min(400 - prev.width, prev.x + deltaX)),
          y: Math.max(0, Math.min(300 - prev.height, prev.y + deltaY))
        }));
      } else if (type === 'resize' && isResizing) {
        setCropArea(prev => ({
          ...prev,
          width: Math.max(50, Math.min(400 - prev.x, prev.width + deltaX)),
          height: Math.max(50, Math.min(300 - prev.y, prev.height + deltaY))
        }));
      }
      setDragStart({ x: moveEvent.clientX, y: moveEvent.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate the actual image dimensions vs display dimensions
    const displayWidth = 400;
    const displayHeight = 300;
    const scaleX = image.naturalWidth / displayWidth;
    const scaleY = image.naturalHeight / displayHeight;

    // Set canvas size to crop area
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Draw the cropped portion
    ctx.drawImage(
      image,
      cropArea.x * scaleX, // source x
      cropArea.y * scaleY, // source y
      cropArea.width * scaleX, // source width
      cropArea.height * scaleY, // source height
      0, // dest x
      0, // dest y
      cropArea.width, // dest width
      cropArea.height // dest height
    );

    // Convert to data URL
    const croppedImageUrl = canvas.toDataURL('image/png', 0.9);
    onCropComplete(croppedImageUrl);
    onClose();
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const newScale = direction === 'in' ? Math.min(3, prev + 0.1) : Math.max(0.5, prev - 0.1);
      return newScale;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Crop Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={() => handleZoom('out')}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-2 text-sm">
              {Math.round(scale * 100)}%
            </span>
            <Button size="sm" variant="outline" onClick={() => handleZoom('in')}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Crop Area */}
          <div className="relative border-2 border-slate-200 rounded-lg overflow-hidden">
            <div
              className="relative w-[400px] h-[300px] mx-auto bg-slate-100"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="w-full h-full object-contain"
                draggable={false}
                onLoad={() => setImageLoaded(true)}
              />
              
              {imageLoaded && (
                <>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />
                  
                  {/* Crop Area */}
                  <div
                    className="absolute border-2 border-white bg-transparent cursor-move"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'drag')}
                  >
                    {/* Resize Handle */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-slate-300 cursor-se-resize"
                      onMouseDown={(e) => handleMouseDown(e, 'resize')}
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Move className="w-6 h-6 text-white opacity-75" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={!imageLoaded}>
            <Crop className="w-4 h-4 mr-2" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
