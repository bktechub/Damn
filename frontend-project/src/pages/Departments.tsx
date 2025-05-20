import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Building2, PlusCircle } from 'lucide-react';
import { departmentService } from '../services/api';
import { DepartmentFormData } from '../types';

const Departments: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>();
  
  const onSubmit = async (data: DepartmentFormData) => {
    try {
      setIsLoading(true);
      await departmentService.create(data);
      toast.success('Department added successfully!');
      reset();
      setShowForm(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save department';
      toast.error(message);
      console.error('Error saving department:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Building2 className="mr-2" size={24} />
            Departments
          </h1>
          <p className="text-gray-600">Add new departments to the system</p>
        </div>
        <button
          onClick={() => {
            reset();
            setShowForm(!showForm);
          }}
          className="btn btn-primary mt-4 md:mt-0 flex items-center"
        >
          <PlusCircle size={18} className="mr-2" />
          Add Department
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-slide-in">
          <h2 className="text-lg font-semibold mb-4">Add New Department</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departmentCode" className="form-label">Department Code</label>
              <input
                id="departmentCode"
                className="form-input"
                {...register('departmentCode', { 
                  required: 'Department code is required',
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message: 'Department code should be uppercase letters and numbers only'
                  }
                })}
              />
              {errors.departmentCode && <p className="form-error">{errors.departmentCode.message}</p>}
            </div>
            
            <div>
              <label htmlFor="departmentName" className="form-label">Department Name</label>
              <input
                id="departmentName"
                className="form-input"
                {...register('departmentName', { required: 'Department name is required' })}
              />
              {errors.departmentName && <p className="form-error">{errors.departmentName.message}</p>}
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
                {isLoading ? 'Adding...' : 'Add Department'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Departments;