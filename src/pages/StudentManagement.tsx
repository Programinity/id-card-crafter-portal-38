
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, GraduationCap, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const StudentManagement = () => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch school years
  const { data: schoolYears, isLoading: yearsLoading } = useQuery({
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

  // Fetch students based on selected year
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
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

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const selectedYearData = schoolYears?.find((year: any) => year.id.toString() === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Student Management</h1>
            <p className="text-slate-600">Select a school year to view enrolled students</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              ID Card Designer
            </Button>
          </Link>
        </div>

        {/* Filters Card */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                School Year
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={yearsLoading ? "Loading..." : "Select School Year"} />
                </SelectTrigger>
                <SelectContent>
                  {schoolYears?.map((year: any) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.school_year} - {year.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedYear && (
              <>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Search className="w-4 h-4 inline mr-2" />
                    Search Students
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name or student ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} variant="outline">
                      Search
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {selectedYearData && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">
                Selected: {selectedYearData.school_year} - {selectedYearData.semester}
              </h3>
              <p className="text-blue-700 text-sm">
                Status: {selectedYearData.status} | Enrollment Status: {selectedYearData.enrollment_status ? 'Open' : 'Closed'}
              </p>
            </div>
          )}
        </Card>

        {/* Students Table */}
        {selectedYear && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Enrolled Students
              </h2>
              {studentsData && (
                <div className="text-sm text-slate-600">
                  Showing {studentsData.data?.length || 0} students
                </div>
              )}
            </div>

            {studentsLoading ? (
              <div className="text-center py-8">
                <div className="text-slate-600">Loading students...</div>
              </div>
            ) : studentsData?.data?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Year Level</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.data.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>
                          {student.first_name} {student.middle_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.course}</TableCell>
                        <TableCell>{student.year_level}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Enrolled
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : selectedYear ? (
              <div className="text-center py-8">
                <div className="text-slate-600">No students found for the selected criteria.</div>
              </div>
            ) : null}

            {/* Pagination would go here if needed */}
            {studentsData?.pagination && (
              <div className="mt-4 flex justify-center">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-slate-600">
                    Page {currentPage}
                  </span>
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
