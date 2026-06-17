-- ==========================================
-- CRECE / SCHOOL ATTENDANCE SYSTEM DATABASE SCHEMA (MYSQL/MARIADB)
-- ==========================================

-- 1. Tabla: Usuarios del Sistema (Rediseñada con Username y Email)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(64) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla: Alumnos del Centro (Rediseñada)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    course VARCHAR(20) NOT NULL,
    UNIQUE KEY uq_student (full_name, course)
);

-- 3. Tabla: Registro de Asistencia (Rediseñada con Relación FK)
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_attendance (student_id, date)
);

-- 4. Tabla: Galería de Actividades (Mantener compatibilidad)
CREATE TABLE IF NOT EXISTS galeria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    description TEXT,
    grade VARCHAR(10),
    date DATE,
    src VARCHAR(255)
);

-- 5. Tabla: Proyectos de Scratch (Mantener compatibilidad)
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    author VARCHAR(150),
    grade VARCHAR(10),
    description TEXT,
    scratch_url VARCHAR(255),
    thumbnail VARCHAR(255)
);

-- 6. Tabla: Guiones de Clase (PDFs) (Mantener compatibilidad)
CREATE TABLE IF NOT EXISTS guiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    grade VARCHAR(10),
    subject VARCHAR(100),
    date DATE,
    pdf_url VARCHAR(255),
    description TEXT
);

-- 7. Tabla: Mensajes de Contacto (Mantener compatibilidad)
CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150),
    email VARCHAR(150),
    subject VARCHAR(150),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data inicial para administrador por defecto
-- password: hash SHA-256 de 'carlos1234'
INSERT INTO users (username, name, email, password, role)
VALUES ('admin', 'Admin Carlos', 'admin@crece.edu', 'e7c5e4e687eba0c36d42eb00e0b4779d98247b1932fbfa85d2eea25332ba2525', 'admin')
ON DUPLICATE KEY UPDATE username=username;
