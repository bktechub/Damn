import express from 'express';
import { pool } from '../server.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateDepartment = [
  body('DepartmentName').trim().notEmpty().withMessage('Department name is required'),
  body('GrossSalary').isNumeric().withMessage('Gross salary must be a number')
];

// Get all departments
router.get('/', async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM Department');
    res.json({
      status: 'success',
      data: departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching departments'
    });
  }
});

// Get single department
router.get('/:code', async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT * FROM Department WHERE DepartmentCode = ?',
      [req.params.code]
    );

    if (departments.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found'
      });
    }

    res.json({
      status: 'success',
      data: departments[0]
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching department'
    });
  }
});

// Create department
router.post('/', validateDepartment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }

  const { DepartmentCode, DepartmentName, GrossSalary } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO Department (DepartmentCode, DepartmentName, GrossSalary) VALUES (?, ?, ?)',
      [DepartmentCode, DepartmentName, GrossSalary]
    );

    res.status(201).json({
      status: 'success',
      message: 'Department created successfully',
      data: { DepartmentCode, DepartmentName, GrossSalary }
    });
  } catch (error) {
    console.error('Error creating department:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Department code already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Error creating department'
    });
  }
});

// Update department
router.put('/:code', validateDepartment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }

  const { DepartmentName, GrossSalary } = req.body;
  const { code } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE Department SET DepartmentName = ?, GrossSalary = ? WHERE DepartmentCode = ?',
      [DepartmentName, GrossSalary, code]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Department updated successfully',
      data: { DepartmentCode: code, DepartmentName, GrossSalary }
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating department'
    });
  }
});

// Delete department
router.delete('/:code', async (req, res) => {
  try {
    // Check if department has employees
    const [employees] = await pool.query(
      'SELECT COUNT(*) as count FROM Employee WHERE DepartmentCode = ?',
      [req.params.code]
    );

    if (employees[0].count > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete department with existing employees'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM Department WHERE DepartmentCode = ?',
      [req.params.code]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting department'
    });
  }
});

export default router; 