export interface Department {
  departmentCode: string;
  departmentName: string;
  grossSalary: number;
}

export type DepartmentFormData = Omit<Department, 'grossSalary'> & {
  grossSalary: number | string;
};

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

export type EmployeeFormData = Omit<Employee, 'employeeNumber'>;

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
  employeeNumber?: number;
  grossSalary?: number;
  totalDeduction?: number;
  month?: string;
  FirstName?: string;
  LastName?: string;
  Position?: string;
  DepartmentName?: string;
  NetSalary?: number | string;
  EmployeeNumber?: number;
  GrossSalary?: number | string;
  TotalDeduction?: number | string;
  Month?: string;
}

export interface ReportMetadata {
  availableMonths: string[];
  counts: {
    employeeCount: number;
    departmentCount: number;
    salaryCount: number;
  };
}

export interface ReportResponse {
  status: 'success' | 'error';
  data: PayrollReport[];
  metadata: ReportMetadata;
}