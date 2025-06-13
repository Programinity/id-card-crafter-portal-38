
import React, { useRef, useState } from 'react';
import { useIDCardStore } from '../store/useIDCardStore';

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
        content: getElementContent(data, selectedStudent)
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

  const handleElementDrag = (elementId: string, newX: number, newY: number) => {
    setCanvasElements(prev => 
      prev.map(el => 
        el.id === elementId 
          ? { ...el, x: newX, y: newY }
          : el
      )
    );
  };

  return (
    <div className="relative">
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
            onDrag={handleElementDrag}
          />
        ))}
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p>Drag fields from the sidebar to design your ID card. Click elements to select and modify them.</p>
      </div>
    </div>
  );
};

interface DraggableCanvasElementProps {
  element: DraggableElement;
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (id: string, x: number, y: number) => void;
}

const DraggableCanvasElement: React.FC<DraggableCanvasElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDrag
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
    onSelect();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    onDrag(element.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`absolute cursor-move border-2 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-slate-400'
      } ${element.type === 'image' ? 'bg-slate-200' : 'bg-white'} rounded px-2 py-1 text-sm font-medium shadow-sm transition-all duration-200`}
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
        <div className="w-full h-full bg-slate-300 rounded flex items-center justify-center text-slate-600">
          📷
        </div>
      ) : (
        <div className="truncate">{element.content}</div>
      )}
    </div>
  );
};
