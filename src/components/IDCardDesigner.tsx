
import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Save, Eye } from 'lucide-react';
import { TemplateUpload } from './TemplateUpload';
import { FieldsSidebar } from './FieldsSidebar';
import { DesignCanvas } from './DesignCanvas';
import { StudentSelector } from './StudentSelector';
import { useIDCardStore } from '../store/useIDCardStore';

export const IDCardDesigner = () => {
  const [activeTab, setActiveTab] = useState('front');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { 
    frontTemplate, 
    backTemplate, 
    frontElements, 
    backElements,
    saveTemplate,
    exportCard 
  } = useIDCardStore();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">ID Card Designer</h1>
          <p className="text-slate-600">Create and customize professional ID cards with drag-and-drop functionality</p>
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
          <StudentSelector onSelectStudent={setSelectedStudent} />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
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
                    {selectedStudent ? `Selected: ${selectedStudent.name}` : 'No student selected'}
                  </div>
                </div>
                
                <TabsContent value="front">
                  <DesignCanvas
                    side="front"
                    template={frontTemplate}
                    elements={frontElements}
                    selectedStudent={selectedStudent}
                  />
                </TabsContent>
                
                <TabsContent value="back">
                  <DesignCanvas
                    side="back"
                    template={backTemplate}
                    elements={backElements}
                    selectedStudent={selectedStudent}
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
