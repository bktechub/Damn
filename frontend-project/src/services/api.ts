import axios from 'axios';
import { Employee, Department, Salary, SalaryFormData, EmployeeFormData, PayrollReport } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// Department service
export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    const departments = response.data?.data || [];
    
    if (!Array.isArray(departments)) return [];
    
    return departments
      .map(dept => ({
        departmentCode: dept.DepartmentCode || dept.departmentCode || '',
        departmentName: dept.DepartmentName || dept.departmentName || '',
        grossSalary: Number(dept.GrossSalary || dept.grossSalary || 0)
      }))
      .filter(dept => 
        dept.departmentCode && 
        dept.departmentName && 
        !isNaN(dept.grossSalary)
      );
  },

  create: async (data: Partial<Department>): Promise<Department | null> => {
    const transformedData = {
      DepartmentCode: data.departmentCode,
      DepartmentName: data.departmentName,
      GrossSalary: Number(data.grossSalary)
    };
    const response = await api.post('/departments', transformedData);
    const department = response.data?.data || response.data;
    return department ? {
      departmentCode: department.DepartmentCode || department.departmentCode,
      departmentName: department.DepartmentName || department.departmentName,
      grossSalary: Number(department.GrossSalary || department.grossSalary)
    } : null;
  }
};

// Employee service
export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employees');
    const employees = response.data?.data || [];
    
    if (!Array.isArray(employees)) return [];
    
    return employees
      .map(emp => ({
        employeeNumber: emp.EmployeeNumber?.toString() || emp.employeeNumber?.toString() || '',
        firstName: emp.FirstName || emp.firstName || '',
        lastName: emp.LastName || emp.lastName || '',
        position: emp.Position || emp.position || '',
        departmentCode: emp.DepartmentCode || emp.departmentCode || '',
        address: emp.Address || emp.address || '',
        telephone: emp.Telephone || emp.telephone || '',
        gender: emp.Gender || emp.gender || '',
        hiredDate: emp.HiredDate || emp.hiredDate || ''
      }))
      .filter(emp => 
        emp.employeeNumber && 
        emp.firstName && 
        emp.lastName && 
        emp.position
      );
  },

  create: async (data: EmployeeFormData): Promise<Employee | null> => {
    // Transform the data to match backend expectations
    const backendData = {
      FirstName: data.firstName?.trim(),
      LastName: data.lastName?.trim(),
      Position: data.position?.trim(),
      Gender: data.gender,
      HiredDate: data.hiredDate,
      DepartmentCode: data.departmentCode?.trim(),
      Address: data.address?.trim() || null,
      Telephone: data.telephone?.trim() || null
    };

    console.log('Sending employee data to backend:', backendData);

    const response = await api.post('/employees', backendData);
    const employee = response.data?.data || response.data;
    
    if (!employee) return null;

    // Transform the response back to frontend format
    return {
      employeeNumber: employee.EmployeeNumber?.toString() || '',
      firstName: employee.FirstName || '',
      lastName: employee.LastName || '',
      position: employee.Position || '',
      departmentCode: employee.DepartmentCode || '',
      address: employee.Address || '',
      telephone: employee.Telephone || '',
      gender: employee.Gender || '',
      hiredDate: employee.HiredDate || ''
    };
  }
};

// Salary service
export const salaryService = {
  getAll: async (): Promise<Salary[]> => {
    const response = await api.get('/salaries');
    const salaries = response.data?.data || [];
    
    if (!Array.isArray(salaries)) return [];
    
    return salaries
      .map(salary => ({
        id: salary.SalaryID?.toString() || salary.salaryID?.toString() || '',
        employeeNumber: salary.EmployeeNumber?.toString() || salary.employeeNumber?.toString() || '',
        month: salary.Month || salary.month || '',
        grossSalary: Number(salary.GrossSalary || salary.grossSalary || 0),
        totalDeduction: Number(salary.TotalDeduction || salary.totalDeduction || 0),
        netSalary: Number(salary.NetSalary || salary.netSalary || 0)
      }))
      .filter(salary => 
        salary.id && 
        salary.employeeNumber && 
        salary.month && 
        !isNaN(salary.grossSalary)
      );
  },

  create: async (data: SalaryFormData): Promise<Salary | null> => {
    const response = await api.post('/salaries', {
      EmployeeNumber: data.employeeNumber,
      Month: data.month,
      GrossSalary: Number(data.grossSalary),
      TotalDeduction: Number(data.totalDeduction)
    });
    const salary = response.data?.data || response.data;
    return salary ? {
      id: salary.SalaryID?.toString() || '',
      employeeNumber: salary.EmployeeNumber?.toString() || '',
      month: salary.Month || '',
      grossSalary: Number(salary.GrossSalary || 0),
      totalDeduction: Number(salary.TotalDeduction || 0),
      netSalary: Number(salary.NetSalary || 0)
    } : null;
  },

  update: async (id: string, data: SalaryFormData): Promise<Salary | null> => {
    const response = await api.put(`/salaries/${id}`, {
      EmployeeNumber: data.employeeNumber,
      Month: data.month,
      GrossSalary: Number(data.grossSalary),
      TotalDeduction: Number(data.totalDeduction)
    });
    const salary = response.data?.data || response.data;
    return salary ? {
      id: salary.SalaryID?.toString() || '',
      employeeNumber: salary.EmployeeNumber?.toString() || '',
      month: salary.Month || '',
      grossSalary: Number(salary.GrossSalary || 0),
      totalDeduction: Number(salary.TotalDeduction || 0),
      netSalary: Number(salary.NetSalary || 0)
    } : null;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/salaries/${id}`);
  }
};

// Report service
export const reportService = {
  getDepartments: async (): Promise<{ code: string; name: string; }[]> => {
    const response = await api.get('/departments');
    const departments = response.data?.data || [];
    
    if (!Array.isArray(departments)) return [];
    
    return departments
      .map(dept => ({
        code: dept.DepartmentCode || dept.departmentCode || '',
        name: dept.DepartmentName || dept.departmentName || ''
      }))
      .filter(dept => dept.code && dept.name);
  },

  getEmployees: async (departmentCode?: string): Promise<Employee[]> => {
    const url = departmentCode 
      ? `/employees?departmentCode=${departmentCode}`
      : '/employees';
    
    const response = await api.get(url);
    const employees = response.data?.data || [];
    
    if (!Array.isArray(employees)) return [];
    
    return employees
      .map(emp => ({
        employeeNumber: emp.EmployeeNumber?.toString() || emp.employeeNumber?.toString() || '',
        firstName: emp.FirstName || emp.firstName || '',
        lastName: emp.LastName || emp.lastName || '',
        position: emp.Position || emp.position || '',
        departmentCode: emp.DepartmentCode || emp.departmentCode || '',
        address: emp.Address || emp.address || '',
        telephone: emp.Telephone || emp.telephone || '',
        gender: emp.Gender || emp.gender || '',
        hiredDate: emp.HiredDate || emp.hiredDate || ''
      }))
      .filter(emp => 
        emp.employeeNumber && 
        emp.firstName && 
        emp.lastName && 
        (!departmentCode || emp.departmentCode === departmentCode)
      );
  },

  getPayrollReport: async (
    month: string,
    departmentCode: string,
    employeeNumber?: string
  ): Promise<PayrollReport[]> => {
    const url = employeeNumber
      ? `/reports/payroll/${month}/${departmentCode}?employeeNumber=${employeeNumber}`
      : `/reports/payroll/${month}/${departmentCode}`;
    
    const response = await api.get(url);
    const reportData = response.data?.data || [];

    if (!Array.isArray(reportData)) return [];

    return reportData
      .map(item => ({
        firstName: item.FirstName || '',
        lastName: item.LastName || '',
        position: item.Position || '',
        departmentName: item.DepartmentName || '',
        netSalary: Number(item.NetSalary || 0),
      }))
      .filter(item => 
        item.firstName && 
        item.lastName && 
        item.position &&
        item.departmentName &&
        !isNaN(item.netSalary)
      );
  }
};

export default api; 