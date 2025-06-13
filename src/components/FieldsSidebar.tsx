
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, MapPin, Phone, Hash } from 'lucide-react';

const availableFields = [
  { id: 'firstName', label: 'First Name', icon: User },
  { id: 'middleName', label: 'Middle Name', icon: User },
  { id: 'lastName', label: 'Last Name', icon: User },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'studentId', label: 'Student ID', icon: Hash },
  { id: 'course', label: 'Course', icon: Calendar },
  { id: 'yearLevel', label: 'Year Level', icon: Calendar },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'phone', label: 'Phone', icon: Phone },
];

export const FieldsSidebar = () => {
  const handleDragStart = (event: React.DragEvent, field: typeof availableFields[0]) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'field',
      field: field
    }));
    console.log('Started dragging field:', field.label);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-700 mb-3">Available Fields</h4>
      {availableFields.map((field) => {
        const Icon = field.icon;
        return (
          <div
            key={field.id}
            draggable
            onDragStart={(e) => handleDragStart(e, field)}
            className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-grab hover:bg-slate-50 hover:shadow-sm transition-all duration-200 active:cursor-grabbing"
          >
            <Icon className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-700">{field.label}</span>
          </div>
        );
      })}
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Special Elements</h4>
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/json', JSON.stringify({
              type: 'image',
              label: 'Profile Photo'
            }));
          }}
          className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-grab hover:bg-slate-50 hover:shadow-sm transition-all duration-200"
        >
          <User className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-700">Profile Photo</span>
        </div>
      </div>
    </div>
  );
};
