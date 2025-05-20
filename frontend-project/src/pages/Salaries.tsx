import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { DollarSign, PlusCircle, Search, Edit, Trash, Info } from 'lucide-react';
import { salaryService, employeeService } from '../services/api';
import { Salary, SalaryFormData, Employee } from '../types';

const Salaries: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SalaryFormData>();
  
  const watchEmployeeNumber = watch('employeeNumber');
  const watchGrossSalary = watch('grossSalary');
  const watchTotalDeduction = watch('totalDeduction');
  
  // Fetch salaries and employees on component mount
  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
  }, []);
  
  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
      const salaries = await salaryService.getAll();
      console.log('Fetched salaries:', salaries);
      // Filter out null values and ensure type safety
      const validSalaries = salaries.filter((salary): salary is Salary => salary !== null);
      setSalaries(validSalaries);
    } catch (error) {
      toast.error('Failed to fetch salaries');
      console.error('Error fetching salaries:', error);
      setSalaries([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const employees = await employeeService.getAll();
      console.log('Fetched employees:', employees);
      // Filter out null values and ensure type safety
      const validEmployees = employees.filter((emp): emp is Employee => emp !== null);
      setEmployees(validEmployees);
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error('Error fetching employees:', error);
      setEmployees([]); // Set empty array on error
    }
  };
  
  // Reset form when editing salary changes
  useEffect(() => {
    if (editingSalary) {
      setValue('employeeNumber', editingSalary.employeeNumber);
      setValue('grossSalary', editingSalary.grossSalary);
      setValue('totalDeduction', editingSalary.totalDeduction);
      setValue('month', editingSalary.month);
      setShowForm(true);
    } else {
      reset();
    }
  }, [editingSalary, setValue, reset]);
  
  // Calculate net salary
  const calculateNetSalary = (grossSalary: number, totalDeduction: number) => {
    return grossSalary - totalDeduction;
  };
  
  const onSubmit = async (data: SalaryFormData) => {
    try {
      console.log('Submitting salary data:', data);
      const salaryData = {
        ...data,
        grossSalary: Number(data.grossSalary),
        totalDeduction: Number(data.totalDeduction),
      };
      
      if (editingSalary?.id) {
        // Update existing salary
        console.log('Updating salary with ID:', editingSalary.id);
        await salaryService.update(editingSalary.id, salaryData);
        toast.success('Salary updated successfully!');
      } else {
        // Create new salary
        console.log('Creating new salary');
        await salaryService.create(salaryData);
        toast.success('Salary added successfully!');
      }
      
      reset();
      setShowForm(false);
      setEditingSalary(null);
      await fetchSalaries(); // Refresh the list
    } catch (error: any) {
      console.error('Error saving salary:', error);
      const message = error.response?.data?.message || 'Failed to save salary';
      toast.error(message);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!id) {
      console.error('Cannot delete salary: No ID provided');
      toast.error('Cannot delete salary: Invalid ID');
      return;
    }

    if (confirm('Are you sure you want to delete this salary record?')) {
      try {
        console.log('Deleting salary with ID:', id);
        await salaryService.delete(id);
        toast.success('Salary record deleted successfully!');
        await fetchSalaries(); // Refresh the list
      } catch (error: any) {
        console.error('Error deleting salary:', error);
        const message = error.response?.data?.message || 'Failed to delete salary record';
        toast.error(message);
      }
    }
  };
  
  const handleEdit = (salary: Salary) => {
    console.log('Editing salary:', salary);
    setEditingSalary(salary);
  };
  
  const getEmployeeName = (employeeNumber: string) => {
    const employee = employees.find(emp => emp.employeeNumber === employeeNumber);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };
  
  const filteredSalaries = salaries.filter(
    (salary) =>
      salary.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getEmployeeName(salary.employeeNumber).toLowerCase().includes(searchQuery.toLowerCase()) ||
      salary.month.includes(searchQuery)
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <DollarSign className="mr-2" size={24} />
            Salaries
          </h1>
          <p className="text-gray-600">Manage employee salary records</p>
        </div>
        <button
          onClick={() => {
            setEditingSalary(null);
            reset();
            setShowForm(!showForm);
          }}
          className="btn btn-primary mt-4 md:mt-0 flex items-center"
        >
          <PlusCircle size={18} className="mr-2" />
          {editingSalary ? 'Edit Salary Record' : 'Add Salary Record'}
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-slide-in">
          <h2 className="text-lg font-semibold mb-4">
            {editingSalary ? 'Edit Salary Record' : 'Add New Salary Record'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employeeNumber" className="form-label">Employee</label>
              <select
                id="employeeNumber"
                className="form-input"
                {...register('employeeNumber', { required: 'Employee is required' })}
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.employeeNumber} value={employee.employeeNumber}>
                    {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                  </option>
                ))}
              </select>
              {errors.employeeNumber && <p className="form-error">{errors.employeeNumber.message}</p>}
            </div>
            
            <div>
              <label htmlFor="month" className="form-label">Month</label>
              <input
                type="month"
                id="month"
                className="form-input"
                {...register('month', { required: 'Month is required' })}
              />
              {errors.month && <p className="form-error">{errors.month.message}</p>}
            </div>
            
            <div>
              <label htmlFor="grossSalary" className="form-label">Gross Salary (RWF)</label>
              <input
                type="number"
                id="grossSalary"
                className="form-input"
                {...register('grossSalary', { 
                  required: 'Gross salary is required',
                  min: {
                    value: 0,
                    message: 'Salary cannot be negative'
                  }
                })}
              />
              {errors.grossSalary && <p className="form-error">{errors.grossSalary.message}</p>}
            </div>
            
            <div>
              <label htmlFor="totalDeduction" className="form-label">Total Deduction (RWF)</label>
              <input
                type="number"
                id="totalDeduction"
                className="form-input"
                {...register('totalDeduction', { 
                  required: 'Total deduction is required',
                  min: {
                    value: 0,
                    message: 'Deduction cannot be negative'
                  },
                  validate: (value) => {
                    const gross = Number(watchGrossSalary);
                    return Number(value) <= gross || 'Deduction cannot be greater than gross salary';
                  }
                })}
              />
              {errors.totalDeduction && <p className="form-error">{errors.totalDeduction.message}</p>}
            </div>
            
            {watchGrossSalary && watchTotalDeduction && (
              <div className="md:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Gross Salary</p>
                      <p className="text-lg font-semibold">{Number(watchGrossSalary).toLocaleString()} RWF</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Deduction</p>
                      <p className="text-lg font-semibold">{Number(watchTotalDeduction).toLocaleString()} RWF</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Net Salary</p>
                      <p className="text-lg font-semibold">
                        {calculateNetSalary(Number(watchGrossSalary), Number(watchTotalDeduction)).toLocaleString()} RWF
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingSalary(null);
                  reset();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingSalary ? 'Update Salary Record' : 'Add Salary Record'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search salary records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary (RWF)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deduction (RWF)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary (RWF)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSalaries.map((salary) => (
                <tr key={salary.id || `salary-${salary.employeeNumber}-${salary.month}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {salary.id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getEmployeeName(salary.employeeNumber)}
                    </div>
                    <div className="text-xs text-gray-500">{salary.employeeNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(salary.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {salary.grossSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {salary.totalDeduction.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {salary.netSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(salary)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(salary.id)}
                      className="text-error-600 hover:text-error-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredSalaries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No salary records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Salaries;