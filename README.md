# Employee Management System

```plaintext
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                                                 │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │                                           │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │                                     │  │  │  │  │
│  │  │  │  │  ┌───────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │                               │  │  │  │  │  │
│  │  │  │  │  │  ┌─────────────────────────┐  │  │  │  │  │  │
│  │  │  │  │  │  │                         │  │  │  │  │  │  │
│  │  │  │  │  │  │  ┌───────────────────┐  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │                   │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  ┌─────────────┐  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │             │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  ┌───────┐  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  │       │  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  │  ┌─┐  │  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  │  │ │  │  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  │  └─┘  │  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  └───────┘  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  └───────────────────┘  │  │  │  │  │  │  │
│  │  │  │  │  │  └─────────────────────────┘  │  │  │  │  │  │
│  │  │  │  │  └───────────────────────────────┘  │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

A full-stack web application for managing employees, departments, and salaries, built with React (Vite + TypeScript + Tailwind CSS) for the frontend and Express.js + MySQL for the backend.

---

## Badges

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/bktechub/Damn)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/tech%20stack-React%20%7C%20Express%20%7C%20MySQL-lightgrey.svg)](https://github.com/bktechub/Damn)

---

## Features
- Employee, Department, and Salary CRUD operations
- Authentication (login/logout)
- Dashboard and reporting
- Responsive UI with modern design

---

## Prerequisites
- **Node.js** (v16 or higher recommended)
- **npm** or **yarn**
- **MySQL** server

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/bktechub/Damn.git
cd Damn
```

### 2. Setup the Database
- Create a MySQL database (e.g., `epms`).
- Run the provided SQL schema to create the tables:

```sql
CREATE TABLE Department (
  DepartmentCode VARCHAR(10) PRIMARY KEY,
  DepartmentName VARCHAR(100) NOT NULL,
  GrossSalary DECIMAL(12,2) NOT NULL
);

CREATE TABLE Employee (
  EmployeeNumber INT PRIMARY KEY AUTO_INCREMENT,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Position VARCHAR(50) NOT NULL,
  Gender VARCHAR(10),
  HiredDate DATE,
  DepartmentCode VARCHAR(10),
  Address VARCHAR(100),
  Telephone VARCHAR(20),
  FOREIGN KEY (DepartmentCode) REFERENCES Department(DepartmentCode)
);

CREATE TABLE Salary (
  SalaryID INT PRIMARY KEY AUTO_INCREMENT,
  EmployeeNumber INT,
  Month VARCHAR(7),
  GrossSalary DECIMAL(12,2),
  TotalDeduction DECIMAL(12,2),
  NetSalary DECIMAL(12,2),
  FOREIGN KEY (EmployeeNumber) REFERENCES Employee(EmployeeNumber)
);
```

---

### 3. Backend Setup

1. Go to the backend directory:
   ```bash
   cd backend-project
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file in the `backend-project` directory with the following:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=hr_management
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000)

---

### 4. Frontend Setup

1. Go to the frontend directory:
   ```bash
   cd frontend-project
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file in the `frontend-project` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will run on [http://localhost:3000](http://localhost:3000) (or as shown in your terminal)

---

## Usage
- Visit the frontend URL in your browser.
- Login with your credentials (default admin may be set in backend).
- Manage employees, departments, and salaries via the UI.
- View reports and dashboard analytics.

---

## Screenshots

(Insert screenshots of your application here.)

---

## Project Structure

```
project-root/
├── backend-project/
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend-project/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md
```

---

## Environment Variables
- **Backend**: `.env` in `backend-project/`
- **Frontend**: `.env` in `frontend-project/`

---

## Troubleshooting
- Ensure MySQL is running and credentials are correct.
- Check `.env` files for correct configuration.
- If ports are in use, change the `PORT` in backend or frontend `.env` files.

---

## License
MIT 
