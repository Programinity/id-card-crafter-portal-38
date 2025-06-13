
import React, { useRef, useState } from 'react';
import { useIDCardStore } from '../store/useIDCardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Bold, Italic, Underline } from 'lucide-react';

interface DesignCanvasProps {
  side: 'front' | 'back';
  template: string | null;
  elements: any[];
  selectedStudent: any;
}

interface DraggableElement {
  id: string;
  type: 'field' | 'image';
  field?: any;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  side,
  template,
  elements,
  selectedStudent
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasElements, setCanvasElements] = useState<DraggableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const { addElement } = useIDCardStore();

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      
      const newElement: DraggableElement = {
        id: `${side}-${Date.now()}`,
        type: data.type,
        field: data.field,
        label: data.label || data.field?.label,
        x,
        y,
        width: 120,
        height: data.type === 'image' ? 120 : 30,
        content: getElementContent(data, selectedStudent),
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none'
      };

      setCanvasElements(prev => [...prev, newElement]);
      addElement(side, newElement);
      console.log('Element added to canvas:', newElement);
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  };

  const getElementContent = (data: any, student: any): string => {
    if (data.type === 'image') {
      return data.label;
    }
    
    if (student && data.field) {
      const fieldMap: { [key: string]: string } = {
        'firstName': student.first_name || 'First Name',
        'middleName': student.middle_name || 'Middle Name',
        'lastName': student.last_name || 'Last Name',
        'email': student.email || 'Email',
        'studentId': student.student_id || 'Student ID',
        'course': student.course || 'Course',
        'yearLevel': student.year_level || 'Year Level',
        'address': student.address || 'Address',
        'phone': student.phone || 'Phone',
      };
      return fieldMap[data.field.id] || data.field.label;
    }
    
    return data.field?.label || 'Field';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleElementUpdate = (elementId: string, updates: Partial<DraggableElement>) => {
    setCanvasElements(prev => 
      prev.map(el => 
        el.id === elementId 
          ? { ...el, ...updates }
          : el
      )
    );
  };

  const selectedElementData = canvasElements.find(el => el.id === selectedElement);

  return (
    <div className="space-y-4">
      <div
        ref={canvasRef}
        className="relative w-full h-96 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          backgroundImage: template ? `url(${template})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {!template && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-lg font-medium">Drop fields here or upload a template</p>
              <p className="text-sm">Design your {side} side ID card</p>
            </div>
          </div>
        )}

        {canvasElements.map((element) => (
          <DraggableCanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onSelect={() => setSelectedElement(element.id)}
            onUpdate={handleElementUpdate}
          />
        ))}
      </div>

      {/* Text Styling Panel */}
      {selectedElementData && selectedElementData.type === 'field' && (
        <Card className="p-4">
          <h4 className="font-medium text-slate-800 mb-3">Text Styling</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Font Size</label>
              <Input
                type="number"
                value={selectedElementData.fontSize || 14}
                onChange={(e) => handleElementUpdate(selectedElement!, { fontSize: parseInt(e.target.value) })}
                min="8"
                max="72"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Color</label>
              <Input
                type="color"
                value={selectedElementData.color || '#000000'}
                onChange={(e) => handleElementUpdate(selectedElement!, { color: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Font Family</label>
              <Select 
                value={selectedElementData.fontFamily || 'Arial'} 
                onValueChange={(value) => handleElementUpdate(selectedElement!, { fontFamily: value })}
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Text Style</label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={selectedElementData.fontWeight === 'bold' ? 'default' : 'outline'}
                  onClick={() => handleElementUpdate(selectedElement!, { 
                    fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' 
                  })}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElementData.fontStyle === 'italic' ? 'default' : 'outline'}
                  onClick={() => handleElementUpdate(selectedElement!, { 
                    fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' 
                  })}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElementData.textDecoration === 'underline' ? 'default' : 'outline'}
                  onClick={() => handleElementUpdate(selectedElement!, { 
                    textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' 
                  })}
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="text-sm text-slate-600">
        <p>Drag fields from the sidebar to design your ID card. Click elements to select and modify them. Drag the corners to resize.</p>
      </div>
    </div>
  );
};

interface DraggableCanvasElementProps {
  element: DraggableElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<DraggableElement>) => void;
}

const DraggableCanvasElement: React.FC<DraggableCanvasElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
    onSelect();
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragStart.x);
      const newY = Math.max(0, e.clientY - dragStart.y);
      onUpdate(element.id, { x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(20, resizeStart.height + deltaY);
      onUpdate(element.id, { width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const textStyle = {
    fontSize: `${element.fontSize || 14}px`,
    fontFamily: element.fontFamily || 'Arial',
    color: element.color || '#000000',
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
    textDecoration: element.textDecoration || 'none',
  };

  return (
    <div
      className={`absolute cursor-move border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-slate-400'
      } rounded transition-all duration-200`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {element.type === 'image' ? (
        <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center text-slate-600 border border-slate-300">
          📷
        </div>
      ) : (
        <div 
          className="w-full h-full flex items-center px-2 overflow-hidden"
          style={textStyle}
        >
          <span className="truncate w-full">{element.content}</span>
        </div>
      )}
      
      {/* Resize Handle */}
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};
