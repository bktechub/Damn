import express from 'express';
import { pool } from '../server.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateEmployee = [
  body('FirstName').trim().notEmpty().withMessage('First name is required'),
  body('LastName').trim().notEmpty().withMessage('Last name is required'),
  body('Position').trim().notEmpty().withMessage('Position is required'),
  body('Gender').isIn(['Male', 'Female']).withMessage('Gender must be either Male or Female'),
  body('HiredDate').isDate().withMessage('Invalid hire date'),
  body('DepartmentCode').trim().notEmpty().withMessage('Department code is required')
];

// Get all employees with department info
router.get('/', async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT e.*, d.DepartmentName 
      FROM Employee e
      LEFT JOIN Department d ON e.DepartmentCode = d.DepartmentCode
      ORDER BY e.EmployeeNumber
    `);
    res.json({
      status: 'success',
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching employees'
    });
  }
});

// Get single employee with department info
router.get('/:id', async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT e.*, d.DepartmentName 
      FROM Employee e
      LEFT JOIN Department d ON e.DepartmentCode = d.DepartmentCode
      WHERE e.EmployeeNumber = ?
    `, [req.params.id]);

    if (employees.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    res.json({
      status: 'success',
      data: employees[0]
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching employee'
    });
  }
});

// Create employee
router.post('/', validateEmployee, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }

  const {
    FirstName,
    LastName,
    Address,
    Position,
    Telephone,
    Gender,
    HiredDate,
    DepartmentCode
  } = req.body;

  try {
    // Verify department exists
    const [departments] = await pool.query(
      'SELECT DepartmentCode FROM Department WHERE DepartmentCode = ?',
      [DepartmentCode]
    );

    if (departments.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid department code'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Employee (
        FirstName, LastName, Address, Position, 
        Telephone, Gender, HiredDate, DepartmentCode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      FirstName, LastName, Address, Position,
      Telephone, Gender, HiredDate, DepartmentCode
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: {
        EmployeeNumber: result.insertId,
        FirstName,
        LastName,
        Address,
        Position,
        Telephone,
        Gender,
        HiredDate,
        DepartmentCode
      }
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating employee'
    });
  }
});

// Update employee
router.put('/:id', validateEmployee, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }

  const {
    FirstName,
    LastName,
    Address,
    Position,
    Telephone,
    Gender,
    HiredDate,
    DepartmentCode
  } = req.body;

  try {
    // Verify department exists
    const [departments] = await pool.query(
      'SELECT DepartmentCode FROM Department WHERE DepartmentCode = ?',
      [DepartmentCode]
    );

    if (departments.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid department code'
      });
    }

    const [result] = await pool.query(`
      UPDATE Employee 
      SET FirstName = ?, LastName = ?, Address = ?, Position = ?,
          Telephone = ?, Gender = ?, HiredDate = ?, DepartmentCode = ?
      WHERE EmployeeNumber = ?
    `, [
      FirstName, LastName, Address, Position,
      Telephone, Gender, HiredDate, DepartmentCode,
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Employee updated successfully',
      data: {
        EmployeeNumber: parseInt(req.params.id),
        FirstName,
        LastName,
        Address,
        Position,
        Telephone,
        Gender,
        HiredDate,
        DepartmentCode
      }
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating employee'
    });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    // Check if employee has salary records
    const [salaries] = await pool.query(
      'SELECT COUNT(*) as count FROM Salary WHERE EmployeeNumber = ?',
      [req.params.id]
    );

    if (salaries[0].count > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete employee with existing salary records'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM Employee WHERE EmployeeNumber = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting employee'
    });
  }
});

export default router; 