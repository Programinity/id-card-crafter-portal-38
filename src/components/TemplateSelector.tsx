
import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  front_image_url: string;
  back_image_url: string;
  front_image_width: number;
  front_image_height: number;
  back_image_width: number;
  back_image_height: number;
}

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void;
  selectedTemplateId?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  selectedTemplateId
}) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Template[];
    }
  });

  const handleTemplateChange = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      onTemplateSelect(template);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-slate-800 mb-3">Select Template</h3>
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading templates...</span>
        </div>
      ) : (
        <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a template..." />
          </SelectTrigger>
          <SelectContent>
            {templates?.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div>
                  <div className="font-medium">{template.name}</div>
                  {template.description && (
                    <div className="text-sm text-slate-500">{template.description}</div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Card>
  );
};
