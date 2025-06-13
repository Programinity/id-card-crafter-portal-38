import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Save, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TemplateUpload } from './TemplateUpload';
import { FieldsSidebar } from './FieldsSidebar';
import { DesignCanvas } from './DesignCanvas';
import { StudentSelector } from './StudentSelector';
import { TemplateSelector } from './TemplateSelector';
import { TemplateFieldsLoader } from './TemplateFieldsLoader';
import { StudentDataRenderer } from './StudentDataRenderer';
import { IDPictureUpload } from './IDPictureUpload';
import { SignaturePad } from './SignaturePad';
import { DraggableFieldsSidebar } from './DraggableFieldsSidebar';
import { useIDCardStore } from '../store/useIDCardStore';

interface IDCardDesignerProps {
  selectedStudent?: any;
}

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

export const IDCardDesigner = ({ selectedStudent: propSelectedStudent }: IDCardDesignerProps) => {
  const [activeTab, setActiveTab] = useState('front');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateFields, setTemplateFields] = useState<{
    front: TemplateField[];
    back: TemplateField[];
  }>({
    front: [],
    back: []
  });
  const [idPicture, setIdPicture] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  
  const { 
    frontTemplate, 
    backTemplate, 
    frontElements, 
    backElements,
    selectedStudent: storeSelectedStudent,
    saveTemplate,
    exportCard 
  } = useIDCardStore();

  // Use either the prop student or the store student
  const selectedStudent = propSelectedStudent || storeSelectedStudent;

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    console.log('Template selected:', template);
  };

  const handleFieldsLoad = useCallback((frontFields: TemplateField[], backFields: TemplateField[]) => {
    setTemplateFields({
      front: frontFields,
      back: backFields
    });
    console.log('Template fields loaded:', { frontFields, backFields });
  }, []);

  const handleSaveTemplate = () => {
    saveTemplate();
    console.log('Template saved successfully');
  };

  const handleExportCard = () => {
    if (!selectedStudent) {
      console.log('Please select a student first');
      return;
    }
    exportCard(selectedStudent);
  };

  const handlePreview = () => {
    console.log('Preview mode activated');
  };

  const handleIDPictureUpload = (imageUrl: string) => {
    setIdPicture(imageUrl);
    console.log('ID Picture uploaded:', imageUrl);
  };

  const handleSignatureChange = (signatureDataUrl: string) => {
    setSignature(signatureDataUrl);
    console.log('Signature updated:', signatureDataUrl);
  };

  const renderTemplateCanvas = (side: 'front' | 'back') => {
    const imageUrl = side === 'front' ? selectedTemplate?.front_image_url : selectedTemplate?.back_image_url;
    const imageWidth = side === 'front' ? selectedTemplate?.front_image_width : selectedTemplate?.back_image_width;
    const imageHeight = side === 'front' ? selectedTemplate?.front_image_height : selectedTemplate?.back_image_height;
    const fields = templateFields[side] || [];

    if (!selectedTemplate) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a Template</h3>
          <p className="text-slate-600">Choose a template from the sidebar to get started</p>
        </div>
      );
    }

    return (
      <div
        className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden mx-auto"
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
              <p className="text-lg font-medium">No image for {side} side</p>
            </div>
          </div>
        )}

        {selectedStudent && fields.length > 0 && (
          <StudentDataRenderer
            fields={fields}
            student={selectedStudent}
            imageWidth={imageWidth || 600}
            imageHeight={imageHeight || 400}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header - only show if not passed as prop (i.e., on main designer page) */}
        {!propSelectedStudent && (
          <>
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">ID Card Designer</h1>
                <p className="text-slate-600">Create and customize professional ID cards with drag-and-drop functionality</p>
              </div>
              <Link to="/students">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Manage Students
                </Button>
              </Link>
            </div>

            {/* Action Bar */}
            <div className="mb-6 flex gap-4 items-center justify-between">
              <div className="flex gap-3">
                <Button onClick={handleSaveTemplate} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
                <Button onClick={handlePreview} variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleExportCard} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Card
                </Button>
              </div>
              <StudentSelector onSelectStudent={() => {}} />
            </div>
          </>
        )}

        {/* Action Bar for Generate ID page */}
        {propSelectedStudent && (
          <div className="mb-6 flex gap-4 items-center justify-between">
            <div className="flex gap-3">
              <Button onClick={handleSaveTemplate} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
              <Button onClick={handlePreview} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleExportCard} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export ID Card
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="space-y-4">
              {/* Template Selector */}
              <TemplateSelector
                onTemplateSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
              />
              
              {/* ID Picture Upload */}
              <IDPictureUpload
                onImageUpload={handleIDPictureUpload}
                currentImage={idPicture}
              />
              
              {/* Signature Pad */}
              <SignaturePad
                onSignatureChange={handleSignatureChange}
                width={320}
                height={160}
              />
              
              {/* Draggable Fields */}
              <DraggableFieldsSidebar />
              
              {/* Design Tools */}
              <Card className="p-4 h-fit">
                <h3 className="font-semibold text-slate-800 mb-4">Design Tools</h3>
                <Tabs defaultValue="templates" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="fields">Fields</TabsTrigger>
                  </TabsList>
                  <TabsContent value="templates" className="mt-4">
                    <TemplateUpload />
                  </TabsContent>
                  <TabsContent value="fields" className="mt-4">
                    <FieldsSidebar />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>

          {/* Main Design Area */}
          <div className="col-span-9">
            <Card className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="front">Front Side</TabsTrigger>
                    <TabsTrigger value="back">Back Side</TabsTrigger>
                  </TabsList>
                  <div className="text-sm text-slate-600">
                    {selectedStudent ? 
                      `Selected: ${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_id})` : 
                      'No student selected'
                    }
                  </div>
                </div>
                
                <TabsContent value="front">
                  {renderTemplateCanvas('front')}
                </TabsContent>
                
                <TabsContent value="back">
                  {renderTemplateCanvas('back')}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>

        {/* Template Fields Loader */}
        {selectedTemplate && (
          <TemplateFieldsLoader
            templateId={selectedTemplate.id}
            onFieldsLoad={handleFieldsLoad}
          />
        )}
      </div>
    </div>
  );
};
