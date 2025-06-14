
import React from 'react';
import { Card } from '@/components/ui/card';
import { Type, Hash, Calendar, Mail, MapPin, User, GraduationCap, Building } from 'lucide-react';

interface FieldItem {
  type: string;
  label: string;
  icon: React.ReactNode;
}

const fieldTypes: FieldItem[] = [
  { type: 'field', label: 'First Name', icon: <User className="w-4 h-4" /> },
  { type: 'field', label: 'Last Name', icon: <User className="w-4 h-4" /> },
  { type: 'field', label: 'Middle Name', icon: <User className="w-4 h-4" /> },
  { type: 'field', label: 'Student ID', icon: <Hash className="w-4 h-4" /> },
  { type: 'field', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { type: 'field', label: 'Course', icon: <GraduationCap className="w-4 h-4" /> },
  { type: 'field', label: 'Year Level', icon: <Calendar className="w-4 h-4" /> },
  { type: 'field', label: 'Department', icon: <Building className="w-4 h-4" /> },
  { type: 'field', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
  { type: 'field', label: 'Phone', icon: <Hash className="w-4 h-4" /> },
  { type: 'field', label: 'Custom Text', icon: <Type className="w-4 h-4" /> },
];

export const DraggableFieldsSidebar: React.FC = () => {
  const handleDragStart = (event: React.DragEvent, field: FieldItem) => {
    // Unified drag data format: type, label, field (full info)
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: field.type,
      label: field.label,
      field: field
    }));
    // For debug
    // console.log('Dragging from sidebar:', { type: field.type, label: field.label, field });
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-slate-800 mb-4">Available Fields</h3>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <div
            key={field.label}
            draggable
            onDragStart={(e) => handleDragStart(e, field)}
            className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-move hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <div className="text-slate-600">
              {field.icon}
            </div>
            <span className="text-sm font-medium text-slate-700">
              {field.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-4">
        Drag fields to the template to add them
      </p>
    </Card>
  );
};
