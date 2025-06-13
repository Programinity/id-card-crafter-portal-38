
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, IdCard, File, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            ID Card Designer
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Create professional ID cards with ease. Design templates, manage students, and generate beautiful ID cards with our intuitive drag-and-drop interface.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/templates">
              <Button size="lg" className="text-lg px-8">
                <File className="w-5 h-5 mr-2" />
                Manage Templates
              </Button>
            </Link>
            <Link to="/students">
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Users className="w-5 h-5 mr-2" />
                Manage Students
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <File className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Template Management</h3>
            <p className="text-slate-600 mb-6">
              Create and manage reusable ID card templates with custom layouts and field positioning.
            </p>
            <Link to="/templates">
              <Button variant="outline" className="w-full">
                Manage Templates
              </Button>
            </Link>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Student Management</h3>
            <p className="text-slate-600 mb-6">
              Add, edit, and organize student information with a comprehensive database system.
            </p>
            <Link to="/students">
              <Button variant="outline" className="w-full">
                Manage Students
              </Button>
            </Link>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <IdCard className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">ID Generation</h3>
            <p className="text-slate-600 mb-6">
              Generate professional ID cards using your templates with student data automatically populated.
            </p>
            <Link to="/students">
              <Button variant="outline" className="w-full">
                Generate IDs
              </Button>
            </Link>
          </Card>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Drag & Drop Design</h4>
                <p className="text-slate-600">Intuitive interface for positioning fields and elements on your ID cards.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Custom Templates</h4>
                <p className="text-slate-600">Create multiple templates for different ID card types and occasions.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Text Styling</h4>
                <p className="text-slate-600">Customize fonts, colors, sizes, and styles for perfect typography.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Zap className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Student Database</h4>
                <p className="text-slate-600">Comprehensive student information management with easy data import.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
