-- SQL Schema for Smart Hospital Queue Management System
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS hospital_queue_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_queue_db;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Patients table
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    address TEXT,
    senior_citizen BOOLEAN DEFAULT FALSE,
    pregnant BOOLEAN DEFAULT FALSE,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    room_no VARCHAR(50) NOT NULL,
    avg_consult_minutes INT NOT NULL DEFAULT 10,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tokens table (Queue engine)
CREATE TABLE IF NOT EXISTS tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_no VARCHAR(50) NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_id BIGINT,
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
    estimated_wait_minutes INT DEFAULT 0,
    is_walk_in BOOLEAN NOT NULL DEFAULT TRUE,
    called_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_token_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_token_app FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Visits table (Patient Consultation History)
CREATE TABLE IF NOT EXISTS visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    token_id BIGINT,
    diagnosis_notes TEXT,
    prescription TEXT,
    vitals VARCHAR(255),
    follow_up_date VARCHAR(50),
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visit_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_token FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Create Indexes for blazing fast queue ordering
CREATE INDEX idx_token_queue ON tokens(doctor_id, status, priority, created_at);
CREATE INDEX idx_patient_phone ON patients(phone);
