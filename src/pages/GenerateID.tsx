
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, IdCard, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { IDCardDesigner } from '@/components/IDCardDesigner';
import { useIDCardStore } from '@/store/useIDCardStore';

const GenerateID = () => {
  const location = useLocation();
  const student = location.state?.student;
  const { setSelectedStudent } = useIDCardStore();

  // Set the selected student in the store when the component mounts
  React.useEffect(() => {
    if (student) {
      setSelectedStudent(student);
    }
  }, [student, setSelectedStudent]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">No Student Selected</h2>
          <p className="text-slate-600 mb-6">Please go back to the student management page and select a student to generate an ID card.</p>
          <Link to="/students">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <IdCard className="w-10 h-10" />
              Generate ID Card
            </h1>
            <p className="text-slate-600">Design and generate ID card for the selected student</p>
          </div>
          <Link to="/students">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Button>
          </Link>
        </div>

        {/* Student Info Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800">
                {student.first_name} {student.middle_name} {student.last_name}
              </h3>
              <div className="text-slate-600 space-y-1">
                <p><strong>Student ID:</strong> {student.student_id}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Course:</strong> {student.course}</p>
                <p><strong>Year Level:</strong> {student.year_level}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ID Card Designer */}
        <IDCardDesigner selectedStudent={student} />
      </div>
    </div>
  );
};

export default GenerateID;
