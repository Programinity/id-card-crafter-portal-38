
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
}

interface TemplateFieldsLoaderProps {
  templateId: string;
  onFieldsLoad: (frontFields: TemplateField[], backFields: TemplateField[]) => void;
}

export const TemplateFieldsLoader: React.FC<TemplateFieldsLoaderProps> = ({
  templateId,
  onFieldsLoad
}) => {
  const { data: fields } = useQuery({
    queryKey: ['templateFields', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_fields')
        .select('*')
        .eq('template_id', templateId);
      
      if (error) throw error;
      return data as TemplateField[];
    },
    enabled: !!templateId
  });

  React.useEffect(() => {
    if (fields) {
      const frontFields = fields.filter(field => field.side === 'front');
      const backFields = fields.filter(field => field.side === 'back');
      onFieldsLoad(frontFields, backFields);
    }
  }, [fields, onFieldsLoad]);

  return null; // This is a utility component that doesn't render anything
};
