import express from 'express';
import { pool } from '../server.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateSalary = [
  body('EmployeeNumber').isInt().withMessage('Employee number must be a valid integer'),
  body('GrossSalary').isNumeric().withMessage('Gross salary must be a number'),
  body('TotalDeduction').isNumeric().withMessage('Total deduction must be a number'),
  body('Month').trim().notEmpty().withMessage('Month is required')
];

// Get all salaries with employee and department info
router.get('/', async (req, res) => {
  try {
    const [salaries] = await pool.query(`
      SELECT s.*, 
             e.FirstName, e.LastName, e.Position,
             d.DepartmentName
      FROM Salary s
      JOIN Employee e ON s.EmployeeNumber = e.EmployeeNumber
      JOIN Department d ON e.DepartmentCode = d.DepartmentCode
      ORDER BY s.Month DESC, e.LastName, e.FirstName
    `);
    res.json({
      status: 'success',
      data: salaries
    });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching salaries'
    });
  }
});

// Get salaries by employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const [salaries] = await pool.query(`
      SELECT s.*, 
             e.FirstName, e.LastName, e.Position,
             d.DepartmentName
      FROM Salary s
      JOIN Employee e ON s.EmployeeNumber = e.EmployeeNumber
      JOIN Department d ON e.DepartmentCode = d.DepartmentCode
      WHERE s.EmployeeNumber = ?
      ORDER BY s.Month DESC
    `, [req.params.employeeId]);

    res.json({
      status: 'success',
      data: salaries
    });
  } catch (error) {
    console.error('Error fetching employee salaries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching employee salaries'
    });
  }
});

// Get salary by ID
router.get('/:id', async (req, res) => {
  try {
    const [salaries] = await pool.query(`
      SELECT s.*, 
             e.FirstName, e.LastName, e.Position,
             d.DepartmentName
      FROM Salary s
      JOIN Employee e ON s.EmployeeNumber = e.EmployeeNumber
      JOIN Department d ON e.DepartmentCode = d.DepartmentCode
      WHERE s.SalaryID = ?
    `, [req.params.id]);

    if (salaries.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Salary record not found'
      });
    }

    res.json({
      status: 'success',
      data: salaries[0]
    });
  } catch (error) {
    console.error('Error fetching salary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching salary'
    });
  }
});

// Create salary record
router.post('/', validateSalary, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }

  const {
    EmployeeNumber,
    GrossSalary,
    TotalDeduction,
    Month
  } = req.body;

  // Calculate net salary
  const NetSalary = GrossSalary - TotalDeduction;

  try {
    // Verify employee exists
    const [employees] = await pool.query(
      'SELECT EmployeeNumber FROM Employee WHERE EmployeeNumber = ?',
      [EmployeeNumber]
    );

    if (employees.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee number'
      });
    }

    // Check for duplicate salary record
    const [existing] = await pool.query(
      'SELECT SalaryID FROM Salary WHERE EmployeeNumber = ? AND Month = ?',
      [EmployeeNumber, Month]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Salary record already exists for this employee and month'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Salary (
        EmployeeNumber, GrossSalary, TotalDeduction, NetSalary, Month
      ) VALUES (?, ?, ?, ?, ?)
    `, [EmployeeNumber, GrossSalary, TotalDeduction, NetSalary, Month]);

    res.status(201).json({
      status: 'success',
      message: 'Salary record created successfully',
      data: {
        SalaryID: result.insertId,
        EmployeeNumber,
        GrossSalary,
        TotalDeduction,
        NetSalary,
        Month
      }
    });
  } catch (error) {
    console.error('Error creating salary record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating salary record'
    });
  }
});

// Update salary record
router.put('/:id', validateSalary, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }

  const {
    EmployeeNumber,
    GrossSalary,
    TotalDeduction,
    Month
  } = req.body;

  // Calculate net salary
  const NetSalary = GrossSalary - TotalDeduction;

  try {
    // Verify employee exists
    const [employees] = await pool.query(
      'SELECT EmployeeNumber FROM Employee WHERE EmployeeNumber = ?',
      [EmployeeNumber]
    );

    if (employees.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee number'
      });
    }

    // Check for duplicate salary record (excluding current record)
    const [existing] = await pool.query(
      'SELECT SalaryID FROM Salary WHERE EmployeeNumber = ? AND Month = ? AND SalaryID != ?',
      [EmployeeNumber, Month, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Salary record already exists for this employee and month'
      });
    }

    const [result] = await pool.query(`
      UPDATE Salary 
      SET EmployeeNumber = ?, GrossSalary = ?, TotalDeduction = ?, 
          NetSalary = ?, Month = ?
      WHERE SalaryID = ?
    `, [EmployeeNumber, GrossSalary, TotalDeduction, NetSalary, Month, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Salary record not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Salary record updated successfully',
      data: {
        SalaryID: parseInt(req.params.id),
        EmployeeNumber,
        GrossSalary,
        TotalDeduction,
        NetSalary,
        Month
      }
    });
  } catch (error) {
    console.error('Error updating salary record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating salary record'
    });
  }
});

// Delete salary record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM Salary WHERE SalaryID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Salary record not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Salary record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting salary record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting salary record'
    });
  }
});

export default router; 