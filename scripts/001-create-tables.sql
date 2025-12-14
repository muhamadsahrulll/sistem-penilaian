-- School Assessment System Database Schema

-- Teachers table (for authentication)
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nis VARCHAR(50),
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grade types table (Tugas, STS, SAS)
CREATE TABLE IF NOT EXISTS grade_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  weight DECIMAL(5,2) DEFAULT NULL,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  grade_type_id INTEGER REFERENCES grade_types(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, grade_type_id)
);

-- Insert default admin teacher (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO teachers (email, password_hash, name) 
VALUES ('admin@sekolah.id', '$2b$10$rQZ8K8HK8L1YqM8K8HK8He5YqM8K8HK8L1YqM8K8HK8He5YqM8K8H', 'Administrator')
ON CONFLICT (email) DO NOTHING;
