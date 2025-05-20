import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { UserPlus, PlusCircle } from 'lucide-react';
import { employeeService, departmentService } from '../services/api';
import { EmployeeFormData, Department } from '../types';

const Employees: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>();
  
  // Fetch departments on component mount
  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await departmentService.getAll();
        if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to fetch departments');
      }
    };
    
    fetchDepartments();
  }, []);
  
  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsLoading(true);
      
      // Log the form data before submission
      console.log('Form data before submission:', data);

      // Validate required fields
      if (!data.firstName?.trim()) {
        toast.error('First name is required');
        return;
      }
      if (!data.lastName?.trim()) {
        toast.error('Last name is required');
        return;
      }
      if (!data.position?.trim()) {
        toast.error('Position is required');
        return;
      }
      if (!data.gender) {
        toast.error('Gender is required');
        return;
      }
      if (!data.hiredDate) {
        toast.error('Hire date is required');
        return;
      }
      if (!data.departmentCode?.trim()) {
        toast.error('Department is required');
        return;
      }

      // Validate gender value
      if (data.gender !== 'Male' && data.gender !== 'Female') {
        toast.error('Gender must be either Male or Female');
        return;
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.hiredDate)) {
        toast.error('Invalid hire date format');
        return;
      }

      await employeeService.create(data);
      toast.success('Employee added successfully!');
      reset();
      setShowForm(false);
    } catch (error: any) {
      // Log the full error
      console.error('Error saving employee:', {
        message: error.message,
        response: error.response?.data,
        validationErrors: error.response?.data?.errors
      });

      // Show a more detailed error message
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.errors?.[0]?.msg || 
                         'Failed to save employee';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <UserPlus className="mr-2" size={24} />
            Employees
          </h1>
          <p className="text-gray-600">Add new employees to the system</p>
        </div>
        <button
          onClick={() => {
            reset();
            setShowForm(!showForm);
          }}
          className="btn btn-primary mt-4 md:mt-0 flex items-center"
        >
          <PlusCircle size={18} className="mr-2" />
          Add Employee
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-slide-in">
          <h2 className="text-lg font-semibold mb-4">Add New Employee</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                id="firstName"
                className="form-input"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
            </div>
            
            <div>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                id="lastName"
                className="form-input"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
            </div>
            
            <div>
              <label htmlFor="position" className="form-label">Position</label>
              <input
                id="position"
                className="form-input"
                {...register('position', { required: 'Position is required' })}
              />
              {errors.position && <p className="form-error">{errors.position.message}</p>}
            </div>
            
            <div>
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                id="gender"
                className="form-input"
                {...register('gender', { 
                  required: 'Gender is required',
                  validate: value => 
                    value === 'Male' || value === 'Female' || 'Gender must be either Male or Female'
                })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <p className="form-error">{errors.gender.message}</p>}
            </div>
            
            <div>
              <label htmlFor="hiredDate" className="form-label">Hire Date</label>
              <input
                type="date"
                id="hiredDate"
                className="form-input"
                {...register('hiredDate', { required: 'Hire date is required' })}
              />
              {errors.hiredDate && <p className="form-error">{errors.hiredDate.message}</p>}
            </div>
            
            <div>
              <label htmlFor="departmentCode" className="form-label">Department</label>
              <select
                id="departmentCode"
                className="form-input"
                {...register('departmentCode', { required: 'Department is required' })}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentCode} value={dept.departmentCode}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
              {errors.departmentCode && <p className="form-error">{errors.departmentCode.message}</p>}
            </div>
            
            <div>
              <label htmlFor="address" className="form-label">Address (Optional)</label>
              <input
                id="address"
                className="form-input"
                {...register('address')}
              />
            </div>
            
            <div>
              <label htmlFor="telephone" className="form-label">Telephone (Optional)</label>
              <input
                id="telephone"
                className="form-input"
                {...register('telephone')}
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Employees;