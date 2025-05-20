import express from 'express';
import { pool } from '../server.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get payroll report for a specific month and optional department
router.get('/payroll/:month/:departmentCode?', verifyToken, async (req, res) => {
  try {
    const { month, departmentCode } = req.params;
    const { employeeNumber } = req.query;
    
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid month format. Use YYYY-MM'
      });
    }
    
    // Validate department code
    if (!departmentCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Department code is required'
      });
    }

    // Get available months
    const [availableMonths] = await pool.query(`
      SELECT DISTINCT Month 
      FROM Salary 
      ORDER BY Month DESC
    `);
    
    // Get database counts
    const [counts] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM Employee) as employeeCount,
        (SELECT COUNT(*) FROM Department) as departmentCount,
        (SELECT COUNT(*) FROM Salary) as salaryCount
    `);
    
    // Main query with LEFT JOINs
    const query = `
      SELECT 
        e.EmployeeNumber,
        e.FirstName,
        e.LastName,
        e.Position,
        d.DepartmentName,
        COALESCE(s.NetSalary, 0) as NetSalary,
        s.Month
      FROM Employee e
      LEFT JOIN Department d ON e.DepartmentCode = d.DepartmentCode
      LEFT JOIN Salary s ON s.EmployeeNumber = e.EmployeeNumber AND s.Month = ?
      WHERE e.DepartmentCode = ?
      ${employeeNumber ? 'AND e.EmployeeNumber = ?' : ''}
      ORDER BY e.LastName, e.FirstName
    `;
    
    const params = employeeNumber 
      ? [month, departmentCode, employeeNumber]
      : [month, departmentCode];
    
    const [reports] = await pool.query(query, params);
    
    // Transform the data to match frontend expectations
    const validReports = reports.map(report => ({
      firstName: report.FirstName,
      lastName: report.LastName,
      position: report.Position,
      departmentName: report.DepartmentName,
      netSalary: Number(report.NetSalary)
    }));
    
    res.json({
      status: 'success',
      data: validReports,
      metadata: {
        availableMonths: availableMonths.map(m => m.Month),
        counts: {
          employeeCount: counts[0].employeeCount,
          departmentCount: counts[0].departmentCount,
          salaryCount: counts[0].salaryCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payroll report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching payroll report: ' + error.message
    });
  }
});

export default router; 