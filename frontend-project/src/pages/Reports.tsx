import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileBarChart2, Search, Download, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { reportService } from '../services/api';
import { PayrollReport } from '../types';

const Reports: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState({
    month: format(new Date(), 'yyyy-MM'),
    departmentCode: '',
    employeeNumber: ''
  });
  
  // Report state
  const [payrollData, setPayrollData] = useState<PayrollReport[]>([]);
  const [departments, setDepartments] = useState<{ code: string; name: string; }[]>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<{ number: string; name: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);
  
  // Fetch employees when department changes
  useEffect(() => {
    if (formData.departmentCode) {
      fetchDepartmentEmployees(formData.departmentCode);
    } else {
      setDepartmentEmployees([]);
    }
  }, [formData.departmentCode]);
  
  const fetchDepartments = async () => {
    try {
      const depts = await reportService.getDepartments();
      const validDepartments = depts.filter(dept => 
        dept && 
        typeof dept.code === 'string' && 
        dept.code.trim() !== '' && 
        typeof dept.name === 'string'
      );
      setDepartments(validDepartments);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  };
  
  const fetchDepartmentEmployees = async (departmentCode: string) => {
    try {
      const emps = await reportService.getEmployees(departmentCode);
      const validEmployees = emps
        .filter(emp => 
          emp && 
          typeof emp.employeeNumber === 'string' && 
          emp.employeeNumber.trim() !== '' && 
          typeof emp.firstName === 'string' && 
          typeof emp.lastName === 'string'
        )
        .map(emp => ({
          number: emp.employeeNumber,
          name: `${emp.firstName} ${emp.lastName}`
        }));
      setDepartmentEmployees(validEmployees);
    } catch (error) {
      toast.error('Failed to load department employees');
      setDepartmentEmployees([]);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset employee selection when department changes
      ...(name === 'departmentCode' ? { employeeNumber: '' } : {})
    }));
  };
  
  const generateReport = async () => {
    try {
      setIsLoading(true);

      const response = await reportService.getPayrollReport(
        formData.month,
        formData.departmentCode,
        formData.employeeNumber
      );

      if (response.data && Array.isArray(response.data)) {
        const validReports = response.data
          .map(report => {
            const firstName = report.firstName || report.FirstName;
            const lastName = report.lastName || report.LastName;
            const position = report.position || report.Position;
            const departmentName = report.departmentName || report.DepartmentName;
            const netSalary = Number(report.netSalary || report.NetSalary || 0);
            
            if (!firstName || !lastName || !position || !departmentName || isNaN(netSalary)) {
              return null;
            }
            
            return {
              firstName,
              lastName,
              position,
              departmentName,
              netSalary
            } as PayrollReport;
          })
          .filter((report): report is PayrollReport => report !== null);

        setPayrollData(validReports);
        
        if (validReports.length === 0) {
          toast.info('No payroll records found for the selected criteria');
        } else {
          toast.success(`Report generated successfully with ${validReports.length} records`);
        }
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter data based on search
  const filteredData = payrollData.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.firstName.toLowerCase().includes(searchLower) ||
      report.lastName.toLowerCase().includes(searchLower) ||
      report.position.toLowerCase().includes(searchLower) ||
      report.departmentName.toLowerCase().includes(searchLower)
    );
  });
  
  // Calculate total net salary
  const totalNetSalary = filteredData.reduce((sum, report) => sum + report.netSalary, 0);
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FileBarChart2 className="mr-2" size={24} />
          Payroll Report Generator
        </h1>
        <p className="text-gray-600">Generate and view monthly employee payroll reports</p>
      </div>
      
      {/* Report Generation Form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        generateReport();
      }} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="month"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              className="form-input w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="departmentCode"
              value={formData.departmentCode}
              onChange={handleInputChange}
              className="form-input w-full"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={`dept-${dept.code}`} value={dept.code}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee (Optional)
            </label>
            <select
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleInputChange}
              className="form-input w-full"
              disabled={!formData.departmentCode}
            >
              <option value="">All Employees in Department</option>
              {departmentEmployees.map((emp) => (
                <option key={`emp-${emp.number}`} value={emp.number}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="submit"
            className="btn btn-primary flex items-center"
            disabled={isLoading || !formData.departmentCode}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FileBarChart2 size={18} className="mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Report Results */}
      {payrollData.length > 0 && (
        <>
          {/* Search and Export */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search in report..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-outline flex items-center"
                >
                  <Printer size={18} className="mr-2" />
                  Print
                </button>
                <button
                  onClick={() => toast.info('Export functionality coming soon')}
                  className="btn btn-primary flex items-center"
                >
                  <Download size={18} className="mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
          
          {/* Report Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary (RWF)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {report.firstName} {report.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.departmentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.netSalary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium">
                      Total Net Salary:
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {totalNetSalary.toLocaleString()} RWF
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;