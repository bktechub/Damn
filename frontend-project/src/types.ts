export interface Employee {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  address: string;
  telephone: string;
  gender: string;
  hiredDate: string;
  departmentCode: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  position: string;
  gender: string;
  hiredDate: string;
  departmentCode: string;
  address?: string;
  telephone?: string;
}

export interface BackendEmployeeData {
  FirstName: string;
  LastName: string;
  Position: string;
  Gender: string;
  HiredDate: string;
  DepartmentCode: string;
  Address?: string;
  Telephone?: string;
}

export interface Department {
  departmentCode: string;
  departmentName: string;
  grossSalary: number;
}

export type DepartmentFormData = Omit<Department, 'grossSalary'> & {
  grossSalary: number | string;
};

export interface Salary {
  id: string;
  employeeNumber: string;
  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  month: string;
}

export type SalaryFormData = Omit<Salary, 'id' | 'netSalary'>;

export interface PayrollReport {
  firstName: string;
  lastName: string;
  position: string;
  departmentName: string;
  netSalary: number;
} 