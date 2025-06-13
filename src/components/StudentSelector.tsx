
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface StudentSelectorProps {
  onSelectStudent: (student: any) => void;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({ onSelectStudent }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch school years
  const { data: schoolYears } = useQuery({
    queryKey: ['schoolYears'],
    queryFn: async () => {
      const response = await fetch('https://portal.epcst.edu.ph/api/schoolyear', {
        headers: {
          'Authorization': 'Bearer 22074|zbWwKwN6XKSDiJBHBliVP19jErG9scYYC5V8JBEv'
        }
      });
      const data = await response.json();
      console.log('School years loaded:', data);
      return data;
    }
  });

  // Fetch students based on selected year and search
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', selectedYear, searchTerm, currentPage],
    queryFn: async () => {
      if (!selectedYear) return null;
      
      const response = await fetch(
        `https://portal.epcst.edu.ph/api/registrants?type=enrolled&year=${selectedYear}&page=${currentPage}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': 'Bearer 22074|zbWwKwN6XKSDiJBHBliVP19jErG9scYYC5V8JBEv'
          }
        }
      );
      const data = await response.json();
      console.log('Students loaded:', data);
      return data;
    },
    enabled: !!selectedYear
  });

  const handleStudentSelect = (studentId: string) => {
    const student = studentsData?.data?.find((s: any) => s.id.toString() === studentId);
    if (student) {
      onSelectStudent(student);
      console.log('Student selected:', student);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-600">Student:</span>
      </div>

      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {schoolYears?.map((year: any) => (
            <SelectItem key={year.id} value={year.id.toString()}>
              {year.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedYear && (
        <>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>

          <Select onValueChange={handleStudentSelect}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={isLoading ? "Loading..." : "Select Student"} />
            </SelectTrigger>
            <SelectContent>
              {studentsData?.data?.map((student: any) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {`${student.first_name} ${student.last_name} - ${student.student_id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
};
