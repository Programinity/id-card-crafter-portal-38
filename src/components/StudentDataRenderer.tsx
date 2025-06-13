
import React from 'react';

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
}

interface StudentDataRendererProps {
  fields: TemplateField[];
  student: any;
  imageWidth: number;
  imageHeight: number;
}

export const StudentDataRenderer: React.FC<StudentDataRendererProps> = ({
  fields,
  student,
  imageWidth,
  imageHeight
}) => {
  const getStudentValue = (fieldLabel: string) => {
    const fieldMap: { [key: string]: string } = {
      'First Name': student?.first_name || '',
      'Middle Name': student?.middle_name || '',
      'Last Name': student?.last_name || '',
      'Email': student?.email || '',
      'Student ID': student?.student_id || '',
      'Course': student?.course || '',
      'Year Level': student?.year_level || '',
      'Address': student?.address || '',
      'Phone': student?.phone || '',
      'Date of Birth': student?.date_of_birth || '',
      'Guardian Name': student?.guardian_name || '',
      'Guardian Contact No': student?.guardian_contact_no || ''
    };
    
    return fieldMap[fieldLabel] || fieldLabel;
  };

  return (
    <>
      {fields.map((field) => (
        <div
          key={field.id}
          className="absolute pointer-events-none"
          style={{
            left: field.x_position,
            top: field.y_position,
            width: field.width,
            height: field.height,
          }}
        >
          {field.field_type === 'image' ? (
            <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center text-slate-600 border border-slate-300">
              📷
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center px-2 overflow-hidden bg-white/80 rounded"
              style={{
                fontSize: `${field.font_size}px`,
                fontFamily: field.font_family,
                color: field.font_color,
                fontWeight: field.font_weight,
                fontStyle: field.font_style,
                textDecoration: field.text_decoration,
              }}
            >
              <span className="truncate w-full">
                {getStudentValue(field.field_label)}
              </span>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
