import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Trash2 } from 'lucide-react';

interface TemplateField {
  id: string;
  field_type: string;
  field_label: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  font_size: number;
  font_family: string;
  font_color: string;
  font_weight: string;
  font_style: string;
  text_decoration: string;
  side: string;
  image_url?: string;
}

interface TemplateCanvasProps {
  side: 'front' | 'back';
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  fields: TemplateField[];
  onFieldsChange: (fields: TemplateField[]) => void;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  side,
  imageUrl,
  imageWidth,
  imageHeight,
  fields,
  onFieldsChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // Listen for insert events from ID Picture and Signature components
  useEffect(() => {
    const handleInsertElement = (event: CustomEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Insert at center of canvas
      const x = (imageWidth || 600) / 2 - 60;
      const y = (imageHeight || 400) / 2 - 60;

      const data = event.detail;
      // For debugging insertion
      // console.log("TemplateCanvas: Received insert element", data);
      let newField: TemplateField;

      if (data.type === 'id_picture' || data.type === 'signature') {
        newField = {
          id: generateUUID(),
          field_type: 'image',
          field_label: data.label,
          x_position: Math.max(0, Math.round(x)),
          y_position: Math.max(0, Math.round(y)),
          width: data.type === 'signature' ? 120 : 100,
          height: data.type === 'signature' ? 60 : 120,
          font_size: 14,
          font_family: 'Arial',
          font_color: '#000000',
          font_weight: 'normal',
          font_style: 'normal',
          text_decoration: 'none',
          side: side,
          image_url: data.imageUrl
        };

        onFieldsChange([...fields, newField]);
        setSelectedField(newField.id);
      }
    };

    window.addEventListener('insertElement', handleInsertElement as EventListener);
    return () => {
      window.removeEventListener('insertElement', handleInsertElement as EventListener);
    };
  }, [fields, onFieldsChange, side, imageWidth, imageHeight]);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      // console.log('TemplateCanvas: dropped data', data);

      let newField: TemplateField;
      if (data.type === 'id_picture' || data.type === 'signature') {
        newField = {
          id: generateUUID(),
          field_type: 'image',
          field_label: data.label,
          x_position: Math.max(0, Math.round(x)),
          y_position: Math.max(0, Math.round(y)),
          width: data.type === 'signature' ? 120 : 100,
          height: data.type === 'signature' ? 60 : 120,
          font_size: 14,
          font_family: 'Arial',
          font_color: '#000000',
          font_weight: 'normal',
          font_style: 'normal',
          text_decoration: 'none',
          side: side,
          image_url: data.imageUrl
        };
      } else {
        newField = {
          id: generateUUID(),
          field_type: data.type,
          field_label: data.field?.label || data.label,
          x_position: Math.max(0, Math.round(x)),
          y_position: Math.max(0, Math.round(y)),
          width: data.type === 'image' ? 120 : 150,
          height: data.type === 'image' ? 120 : 30,
          font_size: 14,
          font_family: 'Arial',
          font_color: '#000000',
          font_weight: 'normal',
          font_style: 'normal',
          text_decoration: 'none',
          side: side
        };
      }

      onFieldsChange([...fields, newField]);
      setSelectedField(newField.id);
    } catch (error) {
      // It's possible another data transfer type was attempted.
      // console.error('Failed to parse drop data:', error);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<TemplateField>) => {
    onFieldsChange(
      fields.map(field => 
        field.id === fieldId 
          ? { ...field, ...updates }
          : field
      )
    );
  };

  const handleDeleteField = (fieldId: string) => {
    onFieldsChange(fields.filter(field => field.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const selectedFieldData = fields.find(field => field.id === selectedField);

  return (
    <div className="space-y-4">
      <div
        ref={canvasRef}
        className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          width: imageWidth || 600,
          height: imageHeight || 400,
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-lg font-medium">Upload an image for the {side} side</p>
              <p className="text-sm">Then drag fields here to position them</p>
            </div>
          </div>
        )}

        {fields.map((field) => (
          <DraggableTemplateField
            key={field.id}
            field={field}
            isSelected={selectedField === field.id}
            onSelect={() => setSelectedField(field.id)}
            onUpdate={handleFieldUpdate}
            onDelete={() => handleDeleteField(field.id)}
            canvasWidth={imageWidth || 600}
            canvasHeight={imageHeight || 400}
          />
        ))}
      </div>

      {/* Field Styling Panel */}
      {selectedFieldData && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-slate-800">Field Styling: {selectedFieldData.field_label}</h4>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteField(selectedField!)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Width</label>
              <Input
                type="number"
                value={selectedFieldData.width}
                onChange={(e) => handleFieldUpdate(selectedField!, { width: parseInt(e.target.value) || 50 })}
                min="50"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Height</label>
              <Input
                type="number"
                value={selectedFieldData.height}
                onChange={(e) => handleFieldUpdate(selectedField!, { height: parseInt(e.target.value) || 20 })}
                min="20"
                max="200"
              />
            </div>
            
            {selectedFieldData.field_type === 'field' && (
              <>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Font Size</label>
                  <Input
                    type="number"
                    value={selectedFieldData.font_size}
                    onChange={(e) => handleFieldUpdate(selectedField!, { font_size: parseInt(e.target.value) || 8 })}
                    min="8"
                    max="72"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Color</label>
                  <Input
                    type="color"
                    value={selectedFieldData.font_color}
                    onChange={(e) => handleFieldUpdate(selectedField!, { font_color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Font Family</label>
                  <Select 
                    value={selectedFieldData.font_family} 
                    onValueChange={(value) => handleFieldUpdate(selectedField!, { font_family: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Impact">Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Text Style</label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={selectedFieldData.font_weight === 'bold' ? 'default' : 'outline'}
                      onClick={() => handleFieldUpdate(selectedField!, { 
                        font_weight: selectedFieldData.font_weight === 'bold' ? 'normal' : 'bold' 
                      })}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFieldData.font_style === 'italic' ? 'default' : 'outline'}
                      onClick={() => handleFieldUpdate(selectedField!, { 
                        font_style: selectedFieldData.font_style === 'italic' ? 'normal' : 'italic' 
                      })}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFieldData.text_decoration === 'underline' ? 'default' : 'outline'}
                      onClick={() => handleFieldUpdate(selectedField!, { 
                        text_decoration: selectedFieldData.text_decoration === 'underline' ? 'none' : 'underline' 
                      })}
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      <div className="text-sm text-slate-600">
        <p>Drag fields from the sidebar to position them on your template. Click to select and modify styling.</p>
      </div>
    </div>
  );
};

interface DraggableTemplateFieldProps {
  field: TemplateField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<TemplateField>) => void;
  onDelete: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

const DraggableTemplateField: React.FC<DraggableTemplateFieldProps> = ({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  canvasWidth,
  canvasHeight
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, fieldX: 0, fieldY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Start dragging
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      fieldX: field.x_position,
      fieldY: field.y_position
    });
    onSelect();

    // Add global mouse event listeners
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isDragging) {
        const deltaX = moveEvent.clientX - dragStart.x;
        const deltaY = moveEvent.clientY - dragStart.y;
        const newX = Math.max(0, Math.min(canvasWidth - field.width, dragStart.fieldX + deltaX));
        const newY = Math.max(0, Math.min(canvasHeight - field.height, dragStart.fieldY + deltaY));
        onUpdate(field.id, { x_position: newX, y_position: newY });
      } else if (isResizing) {
        const deltaX = moveEvent.clientX - resizeStart.x;
        const deltaY = moveEvent.clientY - resizeStart.y;
        const newWidth = Math.max(50, Math.min(canvasWidth - field.x_position, resizeStart.width + deltaX));
        const newHeight = Math.max(20, Math.min(canvasHeight - field.y_position, resizeStart.height + deltaY));
        onUpdate(field.id, { width: newWidth, height: newHeight });
      }
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

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: field.width,
      height: field.height
    });

    // Add global mouse event listeners for resize
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isResizing) {
        const deltaX = moveEvent.clientX - resizeStart.x;
        const deltaY = moveEvent.clientY - resizeStart.y;
        const newWidth = Math.max(50, Math.min(canvasWidth - field.x_position, resizeStart.width + deltaX));
        const newHeight = Math.max(20, Math.min(canvasHeight - field.y_position, resizeStart.height + deltaY));
        onUpdate(field.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && isSelected) {
      onDelete();
    }
  };

  const textStyle = {
    fontSize: `${field.font_size}px`,
    fontFamily: field.font_family,
    color: field.font_color,
    fontWeight: field.font_weight,
    fontStyle: field.font_style,
    textDecoration: field.text_decoration,
  };

  return (
    <div
      className={`absolute cursor-move border-2 ${
        isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-transparent hover:border-slate-400'
      } ${isDragging ? 'opacity-50' : ''} rounded transition-all duration-200 select-none`}
      style={{
        left: field.x_position,
        top: field.y_position,
        width: field.width,
        height: field.height,
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {field.field_type === 'image' ? (
        field.image_url ? (
          <img
            src={field.image_url}
            alt={field.field_label}
            className="w-full h-full object-cover rounded border border-slate-300"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center text-slate-600 border border-slate-300">
            📷
          </div>
        )
      ) : (
        <div 
          className="w-full h-full flex items-center px-2 overflow-hidden bg-white/80 rounded"
          style={textStyle}
        >
          <span className="truncate w-full">{field.field_label}</span>
        </div>
      )}
      
      {/* Resize Handle */}
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize rounded-tl"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};
