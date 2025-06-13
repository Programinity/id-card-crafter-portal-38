import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { FieldsSidebar } from './FieldsSidebar';
import { TemplateCanvas } from './TemplateCanvas';

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
  is_active: boolean;
}

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

interface TemplateDesignerProps {
  template?: Template | null;
  onClose: () => void;
  onSave: () => void;
}

export const TemplateDesigner: React.FC<TemplateDesignerProps> = ({
  template,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('front');
  const [templateData, setTemplateData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    frontImageUrl: template?.front_image_url || '',
    backImageUrl: template?.back_image_url || '',
    frontImageWidth: template?.front_image_width || 0,
    frontImageHeight: template?.front_image_height || 0,
    backImageWidth: template?.back_image_width || 0,
    backImageHeight: template?.back_image_height || 0,
  });
  const [frontFields, setFrontFields] = useState<TemplateField[]>([]);
  const [backFields, setBackFields] = useState<TemplateField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Load existing template fields when editing
  const { data: existingFields } = useQuery({
    queryKey: ['templateFields', template?.id],
    queryFn: async () => {
      if (!template?.id) return [];
      const { data, error } = await supabase
        .from('template_fields')
        .select('*')
        .eq('template_id', template.id);
      
      if (error) throw error;
      return data as TemplateField[];
    },
    enabled: !!template?.id
  });

  // Set fields when existing fields are loaded
  useEffect(() => {
    if (existingFields) {
      const frontFieldsData = existingFields.filter(field => field.side === 'front');
      const backFieldsData = existingFields.filter(field => field.side === 'back');
      setFrontFields(frontFieldsData);
      setBackFields(backFieldsData);
    }
  }, [existingFields]);

  const handleImageUpload = async (file: File, side: 'front' | 'back') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${side}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('templates')
        .getPublicUrl(filePath);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setTemplateData(prev => ({
          ...prev,
          [`${side}ImageUrl`]: data.publicUrl,
          [`${side}ImageWidth`]: img.naturalWidth,
          [`${side}ImageHeight`]: img.naturalHeight,
        }));
      };
      img.src = data.publicUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file, side);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const templatePayload = {
        name: templateData.name,
        description: templateData.description,
        front_image_url: templateData.frontImageUrl,
        back_image_url: templateData.backImageUrl,
        front_image_width: templateData.frontImageWidth,
        front_image_height: templateData.frontImageHeight,
        back_image_width: templateData.backImageWidth,
        back_image_height: templateData.backImageHeight,
        is_active: true,
      };

      let templateId = template?.id;

      if (template) {
        // Update existing template
        const { error } = await supabase
          .from('templates')
          .update(templatePayload)
          .eq('id', template.id);
        
        if (error) throw error;
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('templates')
          .insert([templatePayload])
          .select()
          .single();
        
        if (error) throw error;
        templateId = data.id;
      }

      // Save template fields
      if (templateId) {
        // Delete existing fields
        await supabase
          .from('template_fields')
          .delete()
          .eq('template_id', templateId);

        // Insert new fields
        const allFields = [
          ...frontFields.map(field => ({ ...field, template_id: templateId, side: 'front' })),
          ...backFields.map(field => ({ ...field, template_id: templateId, side: 'back' })),
        ];

        if (allFields.length > 0) {
          const { error: fieldsError } = await supabase
            .from('template_fields')
            .insert(allFields);
          
          if (fieldsError) throw fieldsError;
        }
      }

      toast({
        title: "Success",
        description: `Template ${template ? 'updated' : 'created'} successfully!`,
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              {template ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="text-slate-600">Design your ID card template with drag-and-drop functionality</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>

        {/* Template Info */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Template Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Template Name *
              </label>
              <Input
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <Textarea
                value={templateData.description}
                onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter template description"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Image Upload */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Template Images</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Front Image</label>
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'front')}
                className="hidden"
              />
              <Button
                onClick={() => frontInputRef.current?.click()}
                variant="outline"
                className="w-full mb-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Front Image
              </Button>
              {templateData.frontImageUrl && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <img
                    src={templateData.frontImageUrl}
                    alt="Front template"
                    className="w-full h-auto"
                    style={{
                      width: templateData.frontImageWidth,
                      height: templateData.frontImageHeight,
                      maxWidth: '100%'
                    }}
                  />
                  <div className="p-2 bg-slate-50 text-xs text-slate-600">
                    {templateData.frontImageWidth} × {templateData.frontImageHeight}px
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Back Image</label>
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'back')}
                className="hidden"
              />
              <Button
                onClick={() => backInputRef.current?.click()}
                variant="outline"
                className="w-full mb-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Back Image
              </Button>
              {templateData.backImageUrl && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <img
                    src={templateData.backImageUrl}
                    alt="Back template"
                    className="w-full h-auto"
                    style={{
                      width: templateData.backImageWidth,
                      height: templateData.backImageHeight,
                      maxWidth: '100%'
                    }}
                  />
                  <div className="p-2 bg-slate-50 text-xs text-slate-600">
                    {templateData.backImageWidth} × {templateData.backImageHeight}px
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card className="p-4 h-fit">
              <h3 className="font-semibold text-slate-800 mb-4">Fields</h3>
              <FieldsSidebar />
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="col-span-9">
            <Card className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="front">Front Side</TabsTrigger>
                  <TabsTrigger value="back">Back Side</TabsTrigger>
                </TabsList>
                
                <TabsContent value="front">
                  <TemplateCanvas
                    side="front"
                    imageUrl={templateData.frontImageUrl}
                    imageWidth={templateData.frontImageWidth}
                    imageHeight={templateData.frontImageHeight}
                    fields={frontFields}
                    onFieldsChange={(fields: TemplateField[]) => setFrontFields(fields)}
                  />
                </TabsContent>
                
                <TabsContent value="back">
                  <TemplateCanvas
                    side="back"
                    imageUrl={templateData.backImageUrl}
                    imageWidth={templateData.backImageWidth}
                    imageHeight={templateData.backImageHeight}
                    fields={backFields}
                    onFieldsChange={(fields: TemplateField[]) => setBackFields(fields)}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
