-- Student Management CRUD - Database Schema

CREATE DATABASE student_management;

\c student_management;

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    course VARCHAR(100) NOT NULL,
    year INTEGER DEFAULT 1,
    gpa DECIMAL(3, 2) CHECK (gpa >= 0 AND gpa <= 4),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster searches
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_course ON students(course);
CREATE INDEX idx_students_status ON students(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO students (first_name, last_name, email, phone, date_of_birth, course, year, gpa, status) VALUES
('John', 'Doe', 'john.doe@university.edu', '555-0101', '2002-05-15', 'Computer Science', 3, 3.75, 'active'),
('Jane', 'Smith', 'jane.smith@university.edu', '555-0102', '2001-08-22', 'Engineering', 4, 3.90, 'active'),
('Mike', 'Johnson', 'mike.j@university.edu', '555-0103', '2003-01-10', 'Mathematics', 2, 3.50, 'active'),
('Sarah', 'Williams', 'sarah.w@university.edu', '555-0104', '2002-11-30', 'Computer Science', 3, 3.85, 'active'),
('David', 'Brown', 'david.b@university.edu', '555-0105', '2001-03-18', 'Physics', 4, 3.60, 'graduated');
